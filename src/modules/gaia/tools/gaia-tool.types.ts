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
  RATE_SESSION = 'rate_session',
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

/** Result returned by a write tool that persists directly (live mode). */
export interface IToolConfirmation {
  confirmed: true;
  /** Human-readable summary shown to the user after the action is persisted. */
  humanSummary: string;
}

/** Returned by rate_session tool — signals the gateway to end the session. */
export interface ISessionEndSignal {
  sessionEnded: true;
  score: number;
}

export interface IGaiaTool {
  /** Matches the name used in the Gemini function declaration. */
  readonly name: string;
  readonly declaration: FunctionDeclaration;
  execute(
    args: Record<string, unknown>,
    ctx: IGaiaToolContext,
  ): Promise<TGaiaToolResult | IPendingAction | IToolConfirmation>;
}
