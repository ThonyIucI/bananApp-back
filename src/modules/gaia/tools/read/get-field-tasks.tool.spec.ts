jest.mock('@mikro-orm/postgresql', () => ({ EntityManager: class EntityManager {} }));
jest.mock('@mikro-orm/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = new Proxy(function () { return c; }, {
    get: (_t, prop) => (typeof prop === 'symbol' ? undefined : c),
    apply: () => c,
  });
  return { EntityManager: class EntityManager {}, defineEntity: () => ({ class: class {}, setClass: () => {} }), p: c };
});

import { EntityManager } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { GetFieldTasksTool } from './get-field-tasks.tool';
import type { IGaiaToolContext } from '../gaia-tool.types';

const mockCtx = (userId = 'user-42'): IGaiaToolContext => ({
  currentUser: { sub: userId, email: 'farmer@test.com', iat: 0, exp: 0 },
});

const buildTool = async (emOverride?: Partial<EntityManager>): Promise<{ tool: GetFieldTasksTool; mockEm: jest.Mocked<Pick<EntityManager, 'findAndCount'>> }> => {
  const mockEm = {
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    ...emOverride,
  } as unknown as jest.Mocked<Pick<EntityManager, 'findAndCount'>>;

  const module = await Test.createTestingModule({
    providers: [
      GetFieldTasksTool,
      { provide: EntityManager, useValue: mockEm },
    ],
  }).compile();

  return { tool: module.get(GetFieldTasksTool), mockEm: mockEm as jest.Mocked<Pick<EntityManager, 'findAndCount'>> };
};

describe('GetFieldTasksTool', () => {
  describe('seguridad — scoping por usuario', () => {
    it('siempre filtra por performedByUser.id = currentUser.sub', async () => {
      const { tool, mockEm } = await buildTool();
      await tool.execute({}, mockCtx('user-42'));

      const [, where] = (mockEm.findAndCount as jest.Mock).mock.calls[0] as [unknown, Record<string, unknown>];
      expect((where.performedByUser as Record<string, string>).id).toBe('user-42');
    });

    it('usa el sub del contexto, no de los args del LLM', async () => {
      const { tool, mockEm } = await buildTool();
      // Aunque el LLM enviara un userId en args, no debe usarse — solo ctx.currentUser.sub
      await tool.execute({ userId: 'malicious-user' }, mockCtx('user-42'));

      const [, where] = (mockEm.findAndCount as jest.Mock).mock.calls[0] as [unknown, Record<string, unknown>];
      expect((where.performedByUser as Record<string, string>).id).toBe('user-42');
    });
  });

  describe('filtros opcionales', () => {
    it('añade filtro por taskType.key cuando se pasa taskTypeKey', async () => {
      const { tool, mockEm } = await buildTool();
      await tool.execute({ taskTypeKey: 'irrigation' }, mockCtx());

      const [, where] = (mockEm.findAndCount as jest.Mock).mock.calls[0] as [unknown, Record<string, unknown>];
      expect((where.taskType as Record<string, string>).key).toBe('irrigation');
    });

    it('añade filtro por plot.id cuando se pasa plotId', async () => {
      const { tool, mockEm } = await buildTool();
      await tool.execute({ plotId: 'plot-xyz' }, mockCtx());

      const [, where] = (mockEm.findAndCount as jest.Mock).mock.calls[0] as [unknown, Record<string, unknown>];
      expect((where.plot as Record<string, string>).id).toBe('plot-xyz');
    });

    it('no añade filtro taskType ni plot si no se pasan', async () => {
      const { tool, mockEm } = await buildTool();
      await tool.execute({}, mockCtx());

      const [, where] = (mockEm.findAndCount as jest.Mock).mock.calls[0] as [unknown, Record<string, unknown>];
      expect(where.taskType).toBeUndefined();
      expect(where.plot).toBeUndefined();
    });
  });

  describe('paginación', () => {
    it('usa límite 5 por defecto (detail=false)', async () => {
      const { tool, mockEm } = await buildTool();
      await tool.execute({}, mockCtx());

      const [,, options] = (mockEm.findAndCount as jest.Mock).mock.calls[0] as [unknown, unknown, { limit: number }];
      expect(options.limit).toBe(5);
    });

    it('usa límite 20 cuando detail=true', async () => {
      const { tool, mockEm } = await buildTool();
      await tool.execute({ detail: true }, mockCtx());

      const [,, options] = (mockEm.findAndCount as jest.Mock).mock.calls[0] as [unknown, unknown, { limit: number }];
      expect(options.limit).toBe(20);
    });
  });
});
