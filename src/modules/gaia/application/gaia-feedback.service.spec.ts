/**
 * Unit tests for GaiaFeedbackService.
 *
 * @mikro-orm packages are pure ESM — replaced with factory mocks hoisted above imports.
 */

jest.mock('@mikro-orm/postgresql', () => {
  class EntityManager {}
  return { EntityManager };
});

jest.mock('@mikro-orm/core', () => {
  /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
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
import { GaiaFeedbackService } from './gaia-feedback.service';
import { NotFoundException } from '../../shared/exceptions/domain.exception';
import { EGaiaQueryFeedback } from '../domain/gaia-query-feedback.enum';

const QUERY_ID = 'query-uuid-1';
const USER_ID = 'user-uuid-1';

const buildModule = async (findOneResult: object | null): Promise<{
  service: GaiaFeedbackService;
  flushMock: jest.Mock;
}> => {
  const flushMock = jest.fn().mockResolvedValue(undefined);
  const mockEm = {
    findOne: jest.fn().mockResolvedValue(findOneResult),
    flush: flushMock,
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      GaiaFeedbackService,
      { provide: EntityManager, useValue: mockEm },
    ],
  }).compile();

  return { service: module.get(GaiaFeedbackService), flushMock };
};

describe('GaiaFeedbackService', () => {
  describe('submitFeedback', () => {
    it('lanza NotFoundException si la consulta no pertenece al usuario', async () => {
      const { service } = await buildModule(null);

      await expect(
        service.submitFeedback({ queryId: QUERY_ID, userId: USER_ID, helpful: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('asigna feedback HELPFUL y feedbackAt cuando helpful es true', async () => {
      const query = { feedback: null, feedbackAt: null };
      const { service, flushMock } = await buildModule(query);

      await service.submitFeedback({ queryId: QUERY_ID, userId: USER_ID, helpful: true });

      expect(query.feedback).toBe(EGaiaQueryFeedback.HELPFUL);
      expect(query.feedbackAt).toBeInstanceOf(Date);
      expect(flushMock).toHaveBeenCalledTimes(1);
    });

    it('asigna feedback NOT_HELPFUL cuando helpful es false', async () => {
      const query = { feedback: null, feedbackAt: null };
      const { service } = await buildModule(query);

      await service.submitFeedback({ queryId: QUERY_ID, userId: USER_ID, helpful: false });

      expect(query.feedback).toBe(EGaiaQueryFeedback.NOT_HELPFUL);
    });

    it('permite actualizar un feedback previo (idempotencia de actualización)', async () => {
      const query = { feedback: EGaiaQueryFeedback.NOT_HELPFUL, feedbackAt: new Date() };
      const { service } = await buildModule(query);

      await service.submitFeedback({ queryId: QUERY_ID, userId: USER_ID, helpful: true });

      expect(query.feedback).toBe(EGaiaQueryFeedback.HELPFUL);
    });
  });
});
