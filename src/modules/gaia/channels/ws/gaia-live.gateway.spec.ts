jest.mock('@mikro-orm/postgresql', () => ({ EntityManager: class EntityManager {} }));
jest.mock('@mikro-orm/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = new Proxy(function () { return c; }, {
    get: (_t, prop) => (typeof prop === 'symbol' ? undefined : c),
    apply: () => c,
  });
  return { EntityManager: class EntityManager {}, defineEntity: () => ({ class: class {}, setClass: () => {} }), p: c };
});

// Mocked to prevent module-level mutations on the shared arrays across test runs.
jest.mock('../../tools/gaia-tool-registry', () => ({
  GAIA_READ_TOOLS: [],
  GAIA_WRITE_TOOLS: [],
  toFunctionDeclarations: jest.fn().mockReturnValue([]),
}));

import { Test, TestingModule } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { GaiaLiveGateway } from './gaia-live.gateway';
import { ILLM_SERVICE } from '../../domain/llm/llm.service.interface';
import { GaiaQuotaService } from '../../application/gaia-quota.service';
import { ListMyPlotsTool } from '../../tools/read/list-my-plots.tool';
import { GetFieldTasksTool } from '../../tools/read/get-field-tasks.tool';
import { RegisterFieldTaskTool } from '../../tools/write/register-field-task.tool';

const mockUser = { sub: 'user-1', email: 'farmer@test.com', iat: 0, exp: 0 };

const buildMockSocket = (id = 'socket-1'): jest.Mocked<Pick<Socket, 'id' | 'emit' | 'data'>> => ({
  id,
  emit: jest.fn(),
  data: { user: mockUser },
});

const buildModule = async (
  llmOverrides?: Partial<typeof mockLlm>,
  quotaOverrides?: Partial<typeof mockQuota>,
): Promise<{ gateway: GaiaLiveGateway; llm: typeof mockLlm; quota: typeof mockQuota }> => {
  const llm = { createLiveSession: jest.fn(), chatWithTools: jest.fn(), ...llmOverrides };
  const quota = {
    assertWithinQuota: jest.fn().mockResolvedValue(undefined),
    incrementUsage: jest.fn().mockResolvedValue(undefined),
    getRemainingInteractions: jest.fn().mockResolvedValue({ remaining: 10, limit: 20 }),
    ...quotaOverrides,
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      GaiaLiveGateway,
      { provide: ILLM_SERVICE, useValue: llm },
      { provide: GaiaQuotaService, useValue: quota },
      { provide: ListMyPlotsTool, useValue: { name: 'list_my_plots', execute: jest.fn(), declaration: {} } },
      { provide: GetFieldTasksTool, useValue: { name: 'get_field_tasks', execute: jest.fn(), declaration: {} } },
      { provide: RegisterFieldTaskTool, useValue: { name: 'register_field_task', execute: jest.fn(), declaration: {} } },
    ],
  }).compile();

  return { gateway: module.get(GaiaLiveGateway), llm, quota };
};

// Captures the onTurnComplete callback injected into createLiveSession
const captureTurnComplete = (llm: typeof mockLlm): (() => Promise<void>) => {
  const call = (llm.createLiveSession as jest.Mock).mock.calls[0]?.[0] as { onTurnComplete: () => Promise<void> };
  return call.onTurnComplete;
};

let mockLlm: { createLiveSession: jest.Mock; chatWithTools: jest.Mock };
let mockQuota: {
  assertWithinQuota: jest.Mock;
  incrementUsage: jest.Mock;
  getRemainingInteractions: jest.Mock;
};

describe('GaiaLiveGateway', () => {
  describe('handleStart', () => {
    it('llama a createLiveSession con systemPrompt y tools', async () => {
      const mockLiveSession = { sendAudio: jest.fn(), sendText: jest.fn(), close: jest.fn() };
      const { gateway, llm } = await buildModule({
        createLiveSession: jest.fn().mockResolvedValue(mockLiveSession),
      });

      await gateway.handleStart(buildMockSocket() as unknown as Socket);

      expect(llm.createLiveSession).toHaveBeenCalledTimes(1);
      expect(llm.createLiveSession).toHaveBeenCalledWith(
        expect.objectContaining({ systemPrompt: expect.any(String) }),
      );
    });

    it('emite live:quota_exceeded y aborta si quota está agotada', async () => {
      const { gateway, quota } = await buildModule(undefined, {
        assertWithinQuota: jest.fn().mockRejectedValue(new Error('quota exceeded')),
      });
      const socket = buildMockSocket();

      await gateway.handleStart(socket as unknown as Socket);

      expect(socket.emit).toHaveBeenCalledWith('live:quota_exceeded', {});
      expect(quota.incrementUsage).not.toHaveBeenCalled();
    });
  });

  describe('onTurnComplete — incremento de cuota', () => {
    let gateway: GaiaLiveGateway;
    let llm: typeof mockLlm;
    let quota: typeof mockQuota;
    let socket: ReturnType<typeof buildMockSocket>;

    beforeEach(async () => {
      const mockLiveSession = { sendAudio: jest.fn(), sendText: jest.fn(), close: jest.fn() };
      ({ gateway, llm, quota } = await buildModule({
        createLiveSession: jest.fn().mockResolvedValue(mockLiveSession),
      }));
      socket = buildMockSocket();
      await gateway.handleStart(socket as unknown as Socket);
    });

    it('incrementa la cuota del usuario en cada turno completado', async () => {
      const onTurnComplete = captureTurnComplete(llm);
      await onTurnComplete();
      expect(quota.incrementUsage).toHaveBeenCalledWith(mockUser.sub);
    });

    it('emite live:quota_update tras el incremento con remaining y limit', async () => {
      const onTurnComplete = captureTurnComplete(llm);
      await onTurnComplete();
      expect(socket.emit).toHaveBeenCalledWith(
        'live:quota_update',
        expect.objectContaining({ remaining: 10, limit: 20 }),
      );
    });

    it('emite live:quota_exceeded cuando remaining llega a 0', async () => {
      quota.getRemainingInteractions.mockResolvedValue({ remaining: 0, limit: 20 });
      const onTurnComplete = captureTurnComplete(llm);
      await onTurnComplete();
      expect(socket.emit).toHaveBeenCalledWith('live:quota_exceeded', {});
    });

    it('incrementa la cuota en cada llamada a onTurnComplete', async () => {
      const onTurnComplete = captureTurnComplete(llm);
      await onTurnComplete();
      await onTurnComplete();
      await onTurnComplete();
      expect(quota.incrementUsage).toHaveBeenCalledTimes(3);
    });
  });

  describe('handleDisconnect', () => {
    it('cierra la sesión live y limpia el mapa al desconectar', async () => {
      const mockClose = jest.fn();
      const mockLiveSession = { sendAudio: jest.fn(), sendText: jest.fn(), close: mockClose };
      const { gateway, llm } = await buildModule({
        createLiveSession: jest.fn().mockResolvedValue(mockLiveSession),
      });
      const socket = buildMockSocket();
      await gateway.handleStart(socket as unknown as Socket);

      gateway.handleDisconnect(socket as unknown as Socket);

      expect(mockClose).toHaveBeenCalledTimes(1);
      // Segunda desconexión no debe lanzar error
      expect(() => gateway.handleDisconnect(socket as unknown as Socket)).not.toThrow();
      void llm;
    });
  });
});
