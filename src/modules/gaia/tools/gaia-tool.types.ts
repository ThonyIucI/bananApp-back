import type { JwtPayload } from '../../auth/infrastructure/jwt.strategy';
import type { FunctionDeclaration } from '@google/genai';

export interface IGaiaToolContext {
  currentUser: JwtPayload;
}

/** Result returned by a read tool — JSON-serializable. */
export type TGaiaToolResult = Record<string, unknown> | unknown[];

/** Result returned by a write tool — always a pendingAction, never persists. */
export interface IPendingAction {
  tool: string;
  payload: Record<string, unknown>;
  /** Human-readable summary shown to the user for confirmation. */
  humanSummary: string;
}

export interface IGaiaTool {
  /** Matches the name used in the Gemini function declaration. */
  readonly name: string;
  readonly declaration: FunctionDeclaration;
  execute(args: Record<string, unknown>, ctx: IGaiaToolContext): Promise<TGaiaToolResult | IPendingAction>;
}
