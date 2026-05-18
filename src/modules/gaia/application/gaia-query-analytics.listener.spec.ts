/**
 * Unit tests for GaiaQueryAnalyticsListener.
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
import { GaiaQueryAnalyticsListener } from './gaia-query-analytics.listener';
import { ILLM_SERVICE } from '../domain/llm/llm.service.interface';
import { GaiaMessageProcessedEvent } from '../domain/events/gaia-message-processed.event';
import { EGaiaQueryCategory } from '../domain/gaia-query-category.enum';

const MOCK_QUERY_ID = 'query-uuid-1';
const MOCK_TEXT = '¿Qué fertilizante uso para suelo ácido?';

const MOCK_CLASSIFICATION = {
  category: EGaiaQueryCategory.FERTILIZERS,
  topic: 'selección de fertilizante para suelo ácido',
  summary: 'El usuario pregunta qué fertilizante usar en suelo con pH bajo.',
};

const buildModule = async (overrides?: {
  classifyQuery?: jest.Mock;
  findOne?: jest.Mock;
  flush?: jest.Mock;
}): Promise<GaiaQueryAnalyticsListener> => {
  const mockQuery = { category: null, topic: null, summary: null };

  const mockForkedEm = {
    findOne: overrides?.findOne ?? jest.fn().mockResolvedValue(mockQuery),
    flush: overrides?.flush ?? jest.fn().mockResolvedValue(undefined),
  };

  const mockEm = {
    fork: jest.fn().mockReturnValue(mockForkedEm),
  };

  const mockLlm = {
    classifyQuery:
      overrides?.classifyQuery ??
      jest.fn().mockResolvedValue(MOCK_CLASSIFICATION),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      GaiaQueryAnalyticsListener,
      { provide: ILLM_SERVICE, useValue: mockLlm },
      { provide: EntityManager, useValue: mockEm },
    ],
  }).compile();

  return module.get(GaiaQueryAnalyticsListener);
};

describe('GaiaQueryAnalyticsListener', () => {
  describe('handle', () => {
    it('clasifica la consulta y actualiza el GaiaQuery con category, topic y summary', async () => {
      const flushMock = jest.fn().mockResolvedValue(undefined);
      const mockQuery = { category: null, topic: null, summary: null };
      const findOneMock = jest.fn().mockResolvedValue(mockQuery);

      const listener = await buildModule({
        findOne: findOneMock,
        flush: flushMock,
      });

      const event = new GaiaMessageProcessedEvent({
        queryId: MOCK_QUERY_ID,
        text: MOCK_TEXT,
      });
      await listener.handle(event);

      expect(findOneMock).toHaveBeenCalledWith(expect.anything(), {
        id: MOCK_QUERY_ID,
      });
      expect(mockQuery.category).toBe(EGaiaQueryCategory.FERTILIZERS);
      expect(mockQuery.topic).toBe(MOCK_CLASSIFICATION.topic);
      expect(mockQuery.summary).toBe(MOCK_CLASSIFICATION.summary);
      expect(flushMock).toHaveBeenCalledTimes(1);
    });

    it('no lanza si classifyQuery falla — el error se swallowea', async () => {
      const listener = await buildModule({
        classifyQuery: jest.fn().mockRejectedValue(new Error('Gemini error')),
      });

      const event = new GaiaMessageProcessedEvent({
        queryId: MOCK_QUERY_ID,
        text: MOCK_TEXT,
      });

      await expect(listener.handle(event)).resolves.toBeUndefined();
    });

    it('no llama flush si el GaiaQuery no existe en DB', async () => {
      const flushMock = jest.fn();
      const listener = await buildModule({
        findOne: jest.fn().mockResolvedValue(null),
        flush: flushMock,
      });

      const event = new GaiaMessageProcessedEvent({
        queryId: 'nonexistent-id',
        text: MOCK_TEXT,
      });
      await listener.handle(event);

      expect(flushMock).not.toHaveBeenCalled();
    });
  });
});
