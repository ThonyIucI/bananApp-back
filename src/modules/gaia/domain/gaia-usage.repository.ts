import { GaiaUsage } from './gaia-usage.entity';

export abstract class IGaiaUsageRepository {
  /** Incrementa en 1 el contador de interacciones del día para el usuario. */
  abstract incrementUsage(userId: string, date: string): Promise<GaiaUsage>;
  /** Devuelve el registro de uso para la fecha dada, o null si no existe. */
  abstract getUsageForDate(userId: string, date: string): Promise<GaiaUsage | null>;
}
