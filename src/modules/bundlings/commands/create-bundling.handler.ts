import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Bundling } from '../domain/bundling.entity';
import { IBundlingRepository } from '../domain/bundling.repository';
import { IPlotRepository } from '../../plots/domain/plot.repository';
import { ISubPlotRepository } from '../../plots/domain/sub-plot.repository';
import { IUserRepository } from '../../users/domain/user.repository';
import { IRibbonCalendarRepository } from '../../ribbon-calendars/domain/ribbon-calendar.repository';
import {
  BusinessRuleException,
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/domain.exception';
import {
  CreateBundlingCommand,
  SubPlotEntryCommand,
} from './create-bundling.command';
import { RibbonCalendar } from '../../ribbon-calendars/domain/ribbon-calendar.entity';
import { SubPlot } from '../../plots/domain/sub-plot.entity';
import { User } from '../../users/domain/user.entity';

@Injectable()
export class CreateBundlingHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly bundlingRepo: IBundlingRepository,
    private readonly plotRepo: IPlotRepository,
    private readonly subPlotRepo: ISubPlotRepository,
    private readonly userRepo: IUserRepository,
    private readonly ribbonCalendarRepo: IRibbonCalendarRepository,
  ) {}

  async execute(cmd: CreateBundlingCommand): Promise<Bundling | Bundling[]> {
    if (cmd.subPlotEntries && cmd.subPlotEntries.length > 0) {
      return this.executeMulti(cmd.plotId, cmd.bundledAt, cmd.subPlotEntries);
    }
    return this.executeSingle(cmd);
  }

  /** Branch A — single bundling (existing behaviour). */
  private async executeSingle(cmd: CreateBundlingCommand): Promise<Bundling> {
    if (!cmd.enfundadorUserId || cmd.quantity === undefined || !cmd.localUuid) {
      throw new ValidationException(
        'Los campos enfundadorUserId, quantity y localUuid son obligatorios en modo individual',
        'enfundadorUserId',
      );
    }
    if (!cmd.ribbonCalendarId && !cmd.ribbonColorFree) {
      throw new BusinessRuleException(
        'Debe indicar el calendario de cinta o un color de cinta libre',
      );
    }

    const [plot, enfundadorUser] = await Promise.all([
      this.plotRepo.findById(cmd.plotId),
      this.userRepo.findById(cmd.enfundadorUserId),
    ]);

    if (!plot) throw new NotFoundException('Parcela no encontrada');
    if (!enfundadorUser) throw new NotFoundException('Enfundador no encontrado');

    const hasSubPlots = plot.subPlots.length > 0;
    if (hasSubPlots && !cmd.subPlotId) {
      throw new ValidationException(
        'Debe seleccionar una subparcela para esta parcela',
        'subPlotId',
      );
    }

    let subPlot: SubPlot | undefined = undefined;
    if (cmd.subPlotId) {
      subPlot = await this.subPlotRepo.findById(cmd.subPlotId);
      if (!subPlot) throw new NotFoundException('Subparcela no encontrada');
      const subPlotPlotId = (subPlot.plot as unknown as { id: string }).id;
      if (subPlotPlotId !== cmd.plotId) {
        throw new ValidationException(
          'La subparcela no pertenece a la parcela seleccionada',
          'subPlotId',
        );
      }
    }

    let ribbonCalendar: RibbonCalendar | undefined = undefined;
    if (cmd.ribbonCalendarId) {
      ribbonCalendar = await this.ribbonCalendarRepo.findById(cmd.ribbonCalendarId);
      if (!ribbonCalendar) throw new NotFoundException('Calendario de cinta no encontrado');
    }

    const bundling = Bundling.make({
      plot,
      subPlot,
      enfundadorUser,
      quantity: cmd.quantity,
      bundledAt: cmd.bundledAt,
      localUuid: cmd.localUuid,
      ribbonCalendar,
      ribbonColorFree: cmd.ribbonColorFree,
      notes: cmd.notes,
    });

    this.bundlingRepo.persist(bundling);
    await this.bundlingRepo.flush();
    return bundling;
  }

  /** Branch B — multi bundling (one per subplot entry, transactional). */
  private async executeMulti(
    plotId: string,
    bundledAt: Date,
    entries: SubPlotEntryCommand[],
  ): Promise<Bundling[]> {
    const plot = await this.plotRepo.findById(plotId);
    if (!plot) throw new NotFoundException('Parcela no encontrada');

    if (plot.subPlots.length === 0) {
      throw new ValidationException(
        'La parcela no tiene subparcelas registradas',
        'subPlotEntries',
      );
    }

    const subPlotItems = plot.subPlots.getItems();
    this.validateNoDuplicates(entries, subPlotItems);

    const subPlotMap = this.buildSubPlotMap(subPlotItems);
    const enfundadorMap = await this.loadEnfundadores(entries);
    const ribbonCalendarMap = await this.loadRibbonCalendars(entries);

    return this.em.transactional((txEm) => {
      const bundlings: Bundling[] = [];
      for (const entry of entries) {
        const subPlot = subPlotMap.get(entry.subPlotId)!;
        const enfundadorUser = enfundadorMap.get(entry.enfundadorUserId)!;
        const ribbonCalendar = entry.ribbonCalendarId
          ? ribbonCalendarMap.get(entry.ribbonCalendarId)
          : undefined;

        const b = Bundling.make({
          plot,
          subPlot,
          enfundadorUser,
          quantity: entry.quantity,
          bundledAt,
          localUuid: entry.localUuid,
          ribbonCalendar,
          ribbonColorFree: entry.ribbonColorFree,
          notes: entry.notes,
        });
        txEm.persist(b);
        bundlings.push(b);
      }
      return Promise.resolve(bundlings);
    });
  }

  private validateNoDuplicates(entries: SubPlotEntryCommand[], subPlots: SubPlot[]): void {
    const subPlotIds = entries.map((e) => e.subPlotId);
    const localUuids = entries.map((e) => e.localUuid);

    if (new Set(subPlotIds).size !== subPlotIds.length) {
      throw new ValidationException(
        'Hay subparcelas duplicadas en el envío',
        'subPlotEntries',
      );
    }
    if (new Set(localUuids).size !== localUuids.length) {
      throw new ValidationException(
        'Hay identificadores locales duplicados en el envío',
        'subPlotEntries',
      );
    }

    const validSubPlotIds = new Set(subPlots.map((sp) => sp.id));
    for (const entry of entries) {
      if (!validSubPlotIds.has(entry.subPlotId)) {
        const sp = subPlots.find((s) => s.id === entry.subPlotId);
        const name = sp?.name ?? 'una de las subparcelas seleccionadas';
        throw new ValidationException(
          `La subparcela "${name}" no pertenece a esta parcela`,
          'subPlotEntries',
        );
      }
      if (!entry.ribbonCalendarId && !entry.ribbonColorFree) {
        throw new BusinessRuleException(
          'Cada subparcela debe indicar un calendario de cinta o un color libre',
        );
      }
    }
  }

  private buildSubPlotMap(subPlots: SubPlot[]): Map<string, SubPlot> {
    return new Map(subPlots.map((sp) => [sp.id, sp]));
  }

  private async loadEnfundadores(entries: SubPlotEntryCommand[]): Promise<Map<string, User>> {
    const ids = [...new Set(entries.map((e) => e.enfundadorUserId))];
    const users = await this.userRepo.findByIds(ids);
    const map = new Map(users.map((u) => [u.id, u]));
    for (const id of ids) {
      if (!map.has(id)) throw new NotFoundException('Enfundador no encontrado');
    }
    return map;
  }

  private async loadRibbonCalendars(
    entries: SubPlotEntryCommand[],
  ): Promise<Map<string, RibbonCalendar>> {
    const ids = [...new Set(entries.map((e) => e.ribbonCalendarId).filter(Boolean))] as string[];
    if (ids.length === 0) return new Map();
    const calendars = await Promise.all(ids.map((id) => this.ribbonCalendarRepo.findById(id)));
    const map = new Map<string, RibbonCalendar>();
    for (let i = 0; i < ids.length; i++) {
      if (!calendars[i]) throw new NotFoundException('Calendario de cinta no encontrado');
      map.set(ids[i], calendars[i]!);
    }
    return map;
  }
}
