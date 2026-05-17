/**
 * Unit tests for GaiaQuotaService.
 *
 * @mikro-orm packages are pure ESM and cannot be loaded directly by Jest/ts-jest.
 * They are replaced with factory mocks that are hoisted above all imports.
 */

// Hoisted by ts-jest before any import executes — prevents ESM parse errors.
jest.mock('@mikro-orm/postgresql', () => {
  class EntityManager {}
  return { EntityManager };
});

jest.mock('@mikro-orm/core', () => {
  /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
  // Chain proxy: any property access or call returns itself.
  // Covers p.uuid().primary().onCreate(...) and every other field builder chain.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = new Proxy(
    function () {
      return c;
    },
    {
      get: (_t, prop) => (typeof prop === 'symbol' ? undefined : c),
      apply: () => c,
    },
  );
  return {
    EntityManager: class EntityManager {},
    defineEntity: () => ({ class: class {}, setClass: () => {} }),
    p: c,
  };
  /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
});

import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { GaiaQuotaService } from './gaia-quota.service';
import { IGaiaUsageRepository } from '../domain/gaia-usage.repository';
import { GaiaQuotaExceededException } from '../domain/exceptions/gaia-quota-exceeded.exception';
import { GAIA_PLAN_LIMITS } from '../domain/gaia-plans';
import { EGaiaPlan } from '../../users/domain/user.entity';

const TODAY = new Date().toISOString().split('T')[0];

const buildModule = async (plan: EGaiaPlan, count: number): Promise<GaiaQuotaService> => {
  const mockEm = {
    findOneOrFail: jest.fn().mockResolvedValue({ id: 'user-1', subscriptionTier: plan }),
  };
  const mockRepo = {
    getUsageForDate: jest.fn().mockResolvedValue(count > 0 ? { interactionCount: count } : null),
    incrementUsage: jest.fn().mockResolvedValue({ interactionCount: count + 1 }),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      GaiaQuotaService,
      { provide: IGaiaUsageRepository, useValue: mockRepo },
      { provide: EntityManager, useValue: mockEm },
    ],
  }).compile();

  return module.get(GaiaQuotaService);
};

describe('GaiaQuotaService', () => {
  describe('assertWithinQuota', () => {
    it('pasa cuando count < limit en plan free', async () => {
      const svc = await buildModule(EGaiaPlan.FREE, 5);
      await expect(svc.assertWithinQuota('user-1')).resolves.toBeUndefined();
    });

    it('pasa cuando no hay registro de uso (count = 0)', async () => {
      const svc = await buildModule(EGaiaPlan.FREE, 0);
      await expect(svc.assertWithinQuota('user-1')).resolves.toBeUndefined();
    });

    it('lanza cuando count === limit en plan free', async () => {
      const svc = await buildModule(EGaiaPlan.FREE, GAIA_PLAN_LIMITS.free.dailyInteractions);
      await expect(svc.assertWithinQuota('user-1')).rejects.toThrow(GaiaQuotaExceededException);
    });

    it('lanza cuando count > limit en plan free', async () => {
      const svc = await buildModule(EGaiaPlan.FREE, GAIA_PLAN_LIMITS.free.dailyInteractions + 5);
      await expect(svc.assertWithinQuota('user-1')).rejects.toThrow(GaiaQuotaExceededException);
    });

    it('pasa con 100 interacciones en plan pro (límite 150)', async () => {
      const svc = await buildModule(EGaiaPlan.PRO, 100);
      await expect(svc.assertWithinQuota('user-1')).resolves.toBeUndefined();
    });

    it('lanza cuando count === limit en plan pro', async () => {
      const svc = await buildModule(EGaiaPlan.PRO, GAIA_PLAN_LIMITS.pro.dailyInteractions);
      await expect(svc.assertWithinQuota('user-1')).rejects.toThrow(GaiaQuotaExceededException);
    });

    it('pasa con 499 interacciones en plan promax (límite 500)', async () => {
      const svc = await buildModule(EGaiaPlan.PROMAX, 499);
      await expect(svc.assertWithinQuota('user-1')).resolves.toBeUndefined();
    });
  });

  describe('getRemainingInteractions', () => {
    it('devuelve remaining = limit - count para plan free', async () => {
      const svc = await buildModule(EGaiaPlan.FREE, 10);
      const { remaining, limit } = await svc.getRemainingInteractions('user-1');
      expect(limit).toBe(GAIA_PLAN_LIMITS.free.dailyInteractions);
      expect(remaining).toBe(limit - 10);
    });

    it('devuelve remaining = 0 cuando count alcanzó el límite (sin negativos)', async () => {
      const svc = await buildModule(EGaiaPlan.FREE, GAIA_PLAN_LIMITS.free.dailyInteractions);
      const { remaining } = await svc.getRemainingInteractions('user-1');
      expect(remaining).toBe(0);
    });

    it('devuelve remaining = limit cuando no hay uso registrado', async () => {
      const svc = await buildModule(EGaiaPlan.FREE, 0);
      const { remaining, limit } = await svc.getRemainingInteractions('user-1');
      expect(remaining).toBe(limit);
    });

    it('refleja el límite correcto del plan pro', async () => {
      const svc = await buildModule(EGaiaPlan.PRO, 0);
      const { limit } = await svc.getRemainingInteractions('user-1');
      expect(limit).toBe(GAIA_PLAN_LIMITS.pro.dailyInteractions);
    });
  });

  describe('incrementUsage', () => {
    it('llama al repositorio con userId y la fecha de hoy', async () => {
      const mockRepo = {
        getUsageForDate: jest.fn().mockResolvedValue(null),
        incrementUsage: jest.fn().mockResolvedValue({ interactionCount: 1 }),
      };
      const mockEm = {
        findOneOrFail: jest.fn().mockResolvedValue({ id: 'user-1', subscriptionTier: EGaiaPlan.FREE }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GaiaQuotaService,
          { provide: IGaiaUsageRepository, useValue: mockRepo },
          { provide: EntityManager, useValue: mockEm },
        ],
      }).compile();

      const svc = module.get(GaiaQuotaService);
      await svc.incrementUsage('user-1');

      expect(mockRepo.incrementUsage).toHaveBeenCalledWith('user-1', TODAY);
    });
  });
});
