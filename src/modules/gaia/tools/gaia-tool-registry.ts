import type { FunctionDeclaration } from '@google/genai';
import type { IGaiaTool } from './gaia-tool.types';

/** Read-only tools safe to execute automatically. */
export const GAIA_READ_TOOLS: IGaiaTool[] = [];

/** Write tools that must become a pendingAction before persisting. */
export const GAIA_WRITE_TOOLS: IGaiaTool[] = [];

/** All tools combined, for quick lookup by name. */
export const GAIA_TOOL_MAP = new Map<string, IGaiaTool>();

export const registerTool = (tool: IGaiaTool): void => {
  GAIA_TOOL_MAP.set(tool.name, tool);
};

/** Converts a list of IGaiaTool into Gemini FunctionDeclaration format. */
export const toFunctionDeclarations = (tools: IGaiaTool[]): FunctionDeclaration[] =>
  tools.map((t) => t.declaration);
