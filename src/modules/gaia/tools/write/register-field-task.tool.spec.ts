// MikroORM es ESM puro — se mockea antes de cualquier import para evitar errores de parse.
jest.mock('@mikro-orm/postgresql', () => ({ EntityManager: class EntityManager {} }));
jest.mock('@mikro-orm/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = new Proxy(function () { return c; }, {
    get: (_t, prop) => (typeof prop === 'symbol' ? undefined : c),
    apply: () => c,
  });
  return { EntityManager: class EntityManager {}, defineEntity: () => ({ class: class {}, setClass: () => {} }), p: c };
});

import { RegisterFieldTaskTool } from './register-field-task.tool';
import type { IGaiaToolContext } from '../gaia-tool.types';

const mockCtx = (): IGaiaToolContext => ({
  currentUser: { sub: 'user-1', email: 'farmer@test.com', iat: 0, exp: 0 },
});

const baseArgs = {
  plotId: 'plot-abc',
  taskTypeKey: 'irrigation',
  taskLabel: 'Riego por goteo',
  performedAt: '2025-05-31T07:00:00',
};

describe('RegisterFieldTaskTool', () => {
  let tool: RegisterFieldTaskTool;

  beforeEach(() => {
    tool = new RegisterFieldTaskTool();
  });

  it('retorna un IPendingAction con tool, payload y humanSummary', async () => {
    const result = await tool.execute(baseArgs, mockCtx());
    expect(result).toMatchObject({
      tool: 'register_field_task',
      humanSummary: expect.stringContaining('Riego por goteo'),
      payload: expect.objectContaining({
        plotId: 'plot-abc',
        taskTypeKey: 'irrigation',
        performedAt: '2025-05-31T07:00:00',
      }),
    });
  });

  it('nunca persiste directamente (no tiene EntityManager inyectado)', () => {
    // RegisterFieldTaskTool no recibe EntityManager — solo construye un pendingAction.
    // Verificamos que el constructor no requiere argumentos de base de datos.
    expect(() => new RegisterFieldTaskTool()).not.toThrow();
  });

  it('incluye las notas en el payload y en el humanSummary si se proporcionan', async () => {
    const args = { ...baseArgs, notes: 'Turno de 2 horas' };
    const result = await tool.execute(args, mockCtx());
    expect(result.payload).toMatchObject({ notes: 'Turno de 2 horas' });
    expect(result.humanSummary).toContain('Turno de 2 horas');
  });

  it('asigna null a notes en el payload cuando no se pasan', async () => {
    const result = await tool.execute(baseArgs, mockCtx());
    expect(result.payload).toMatchObject({ notes: null });
  });

  it('no hace referencia a ctx.currentUser.sub — el write tool no se auto-persiste', async () => {
    const result = await tool.execute(baseArgs, mockCtx());
    // El payload no debe filtrar por userId — el controller lo determina desde el JWT del request HTTP
    expect(JSON.stringify(result.payload)).not.toContain('user-1');
  });
});
