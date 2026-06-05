import { Test } from '@nestjs/testing';
import { GaiaSessionContextService } from './gaia-session-context.service';
import { ListPlotsHandler } from '../../plots/queries/list-plots.handler';
import { EntityManager } from '@mikro-orm/postgresql';
import { Collection } from '@mikro-orm/core';
import { TaskType } from '../../field-tasks/domain/task-type.entity';
import {
  EDetailValueType,
  TaskTypeDetailSchema,
} from '../../field-tasks/domain/task-type-detail-schema.entity';
import { TaskTypeDetailOption } from '../../field-tasks/domain/task-type-detail-option.entity';
import { CropType } from '../../crop-types/domain/crop-type.entity';

const mockCollection = <T extends object>(items: T[]) =>
  ({ getItems: () => items, length: items.length }) as unknown as Collection<T>;

const makeCropType = (key: string): CropType => ({ key } as CropType);

const makeOption = (key: string): TaskTypeDetailOption =>
  ({ key } as TaskTypeDetailOption);

const makeSchema = (
  detailKey: string,
  valueType: EDetailValueType,
  isRequired: boolean,
  options: TaskTypeDetailOption[] = [],
  sortOrder = 0,
): TaskTypeDetailSchema =>
  ({
    detailKey,
    valueType,
    isRequired,
    sortOrder,
    detailOptions: mockCollection(options),
  }) as unknown as TaskTypeDetailSchema;

const makeTaskType = (
  key: string,
  cropTypeKeys: string[],
  schemas: TaskTypeDetailSchema[],
): TaskType =>
  ({
    key,
    isActive: true,
    cropTypes: mockCollection(cropTypeKeys.map(makeCropType)),
    detailSchemas: mockCollection(schemas),
  }) as unknown as TaskType;

describe('GaiaSessionContextService', () => {
  let service: GaiaSessionContextService;
  let listPlotsHandler: jest.Mocked<ListPlotsHandler>;
  let em: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GaiaSessionContextService,
        {
          provide: ListPlotsHandler,
          useValue: { execute: jest.fn() },
        },
        {
          provide: EntityManager,
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GaiaSessionContextService);
    listPlotsHandler = module.get(ListPlotsHandler);
    em = module.get(EntityManager);
  });

  it('returns "PARCELAS: ninguna registrada" when user has no plots', async () => {
    listPlotsHandler.execute.mockResolvedValue({
      items: [],
      total: 0,
      limit: 100,
      offset: 0,
    });

    const result = await service.buildUserContextBlock('user-1');

    expect(result).toBe('PARCELAS: ninguna registrada');
    expect(em.find).not.toHaveBeenCalled();
  });

  it('builds ACT[banano] + ACT[*] for user with banana plots', async () => {
    listPlotsHandler.execute.mockResolvedValue({
      items: [
        {
          id: '1',
          name: 'Lote Norte',
          sector: { name: 'Sector A' },
          cropType: { key: 'banana', label: 'Banano' },
        } as never,
      ],
      total: 1,
      limit: 100,
      offset: 0,
    });

    const bananaTask = makeTaskType(
      'bundling',
      ['banana'],
      [
        makeSchema('ribbonColor', EDetailValueType.ENUM, true, [
          makeOption('red'),
          makeOption('blue'),
        ]),
        makeSchema('bunches', EDetailValueType.NUMERIC, true),
      ],
    );

    const universalTask = makeTaskType(
      'irrigation',
      [],
      [makeSchema('source', EDetailValueType.ENUM, true, [makeOption('well')])],
    );

    em.find.mockResolvedValue([bananaTask, universalTask]);

    const result = await service.buildUserContextBlock('user-1');

    expect(result).toContain('PARCELAS: Lote Norte(Sector A,banana)');
    expect(result).toContain('ACT[banana]:');
    expect(result).toContain('bundling(ribbonColor:ENUM[red,blue]*,bunches:NUM*)');
    expect(result).toContain('ACT[*]:');
    expect(result).toContain('irrigation(source:ENUM[well]*)');
  });

  it('shows only ACT[*] when plot has no cropType', async () => {
    listPlotsHandler.execute.mockResolvedValue({
      items: [
        {
          id: '2',
          name: 'Lote Sur',
          sector: null,
          cropType: null,
        } as never,
      ],
      total: 1,
      limit: 100,
      offset: 0,
    });

    const universalTask = makeTaskType('harvest', [], [
      makeSchema('quantity', EDetailValueType.NUMERIC, true),
    ]);

    em.find.mockResolvedValue([universalTask]);

    const result = await service.buildUserContextBlock('user-1');

    expect(result).toContain('PARCELAS: Lote Sur(sin sector,sin cultivo)');
    expect(result).not.toContain('ACT[banana]');
    expect(result).toContain('ACT[*]:');
    expect(result).toContain('harvest(quantity:NUM*)');
  });
});
