import type { JwtPayload } from '../../auth/infrastructure/jwt.strategy';
import type { FunctionDeclaration } from '@google/genai';

export interface IGaiaToolContext {
  currentUser: JwtPayload;
}

/** Centralizes the names used in Gemini function declarations to avoid duplication. */
export enum EGaiaToolName {
  LIST_MY_PLOTS = 'list_my_plots',
  GET_FIELD_TASKS = 'get_field_tasks',
  REGISTER_FIELD_TASK = 'register_field_task',
}

/** Result returned by a read tool — JSON-serializable. */
export type TGaiaToolResult = Record<string, unknown> | unknown[];

/** Result returned by a write tool — always a pendingAction, never persists. */
export interface IPendingAction {
  tool: EGaiaToolName;
  payload: Record<string, unknown>;
  /** Human-readable summary shown to the user for confirmation. */
  humanSummary: string;
}

/** Payload shape for field-task write tools with dynamic detail fields. */
export interface IFieldTaskPendingPayload {
  plotId: string;
  taskTypeKey: string;
  performedAt: string;
  notes: string | null;
  details: Record<string, string | number>;
}

export interface IGaiaTool {
  /** Matches the name used in the Gemini function declaration. */
  readonly name: string;
  readonly declaration: FunctionDeclaration;
  execute(
    args: Record<string, unknown>,
    ctx: IGaiaToolContext,
  ): Promise<TGaiaToolResult | IPendingAction>;
}
