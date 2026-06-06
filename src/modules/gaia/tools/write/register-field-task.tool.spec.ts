// MikroORM es ESM puro — se mockea antes de cualquier import.
jest.mock('@mikro-orm/postgresql', () => ({ EntityManager: class EntityManager {} }));
jest.mock('@mikro-orm/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = new Proxy(function () { return c; }, {
    get: (_t, prop) => (typeof prop === 'symbol' ? undefined : c),
    apply: () => c,
  });
  return {
    EntityManager: class EntityManager {},
    defineEntity: () => ({ class: class {}, setClass: () => {} }),
    p: c,
  };
});

import { RegisterFieldTaskTool } from './register-field-task.tool';
import { CreateFieldTaskService } from '../../../field-tasks/services/create-field-task.service';
import type { IGaiaToolContext } from '../gaia-tool.types';

const mockCtx = (): IGaiaToolContext => ({
  currentUser: { sub: 'user-1', email: 'farmer@test.com', isSuperadmin: false },
});

const baseArgs = {
  plotId: 'plot-abc',
  taskTypeKey: 'irrigation',
  taskLabel: 'Riego por goteo',
  performedAt: '2025-05-31T07:00:00',
};

describe('RegisterFieldTaskTool', () => {
  let tool: RegisterFieldTaskTool;
  let mockHandler: jest.Mocked<Pick<CreateFieldTaskService, 'execute'>>;

  beforeEach(() => {
    mockHandler = { execute: jest.fn().mockResolvedValue({}) };
    tool = new RegisterFieldTaskTool(mockHandler as unknown as CreateFieldTaskService);
  });

  it('persiste directamente y devuelve confirmed:true', async () => {
    const result = await tool.execute(baseArgs, mockCtx());

    expect(mockHandler.execute).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ confirmed: true });
  });

  it('pasa details como array de { detailKey, value } al handler', async () => {
    const args = {
      ...baseArgs,
      details: { ribbonColor: 'verde', bunches: '45' },
    };

    await tool.execute(args, mockCtx());

    expect(mockHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.arrayContaining([
          { detailKey: 'ribbonColor', value: 'verde' },
          { detailKey: 'bunches', value: '45' },
        ]),
      }),
    );
  });

  it('humanSummary incluye los details en lenguaje natural', async () => {
    const args = {
      ...baseArgs,
      taskLabel: 'Enfunde',
      details: { ribbonColor: 'verde', fundas: '45' },
    };

    const result = await tool.execute(args, mockCtx());

    expect(result.humanSummary).toContain('Enfunde');
    expect(result.humanSummary).toContain('ribbonColor: verde');
    expect(result.humanSummary).toContain('fundas: 45');
    expect(result.humanSummary).toContain('realizado por ti');
  });

  it('usa ctx.currentUser.sub como performedByUserId', async () => {
    await tool.execute(baseArgs, mockCtx());

    expect(mockHandler.execute).toHaveBeenCalledWith(
      expect.objectContaining({ performedByUserId: 'user-1' }),
    );
  });

  it('convierte performedAt string a Date al llamar al handler', async () => {
    await tool.execute(baseArgs, mockCtx());

    const call = mockHandler.execute.mock.calls[0][0];
    expect(call.performedAt).toBeInstanceOf(Date);
  });
});
