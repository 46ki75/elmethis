import type { AnyToolDef, JsonSchemaToolDef } from "./tool-registry";
import type { McpToolDescriptor } from "./mcp-types";

/**
 * Upper bound on the final tool name surfaced to the agent. Matches
 * OpenAI's function-name limit; most provider APIs enforce the same.
 */
const MAX_TOOL_NAME_LENGTH = 64;
const VALID_TOOL_NAME = /^[a-zA-Z0-9_-]+$/;

export interface AdaptMcpToolOptions {
  /**
   * If provided, the resulting tool name is `${prefix}__${descriptor.name}`.
   * Omit to use the descriptor's raw name (collision risk across
   * servers).
   */
  prefix?: string;
}

/**
 * Convert a single MCP `tools/list` descriptor into an entry that fits
 * the local `ToolRegistry`.
 *
 * The returned `tool.execute` calls back into `callTool` with the
 * **original** (un-prefixed) name — the prefix is purely a local-side
 * identifier for the LLM.
 *
 * Throws if the resulting name violates the agent-side tool-name
 * constraints (length or character set), so the failure surfaces at
 * connection time rather than as a runtime 400 from the model provider.
 */
export function adaptMcpTool(
  descriptor: McpToolDescriptor,
  callTool: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<unknown>,
  options: AdaptMcpToolOptions = {},
): { name: string; tool: AnyToolDef } {
  const finalName =
    options.prefix !== undefined
      ? `${options.prefix}__${descriptor.name}`
      : descriptor.name;

  if (finalName.length > MAX_TOOL_NAME_LENGTH) {
    throw new Error(
      `MCP tool name "${finalName}" exceeds ${MAX_TOOL_NAME_LENGTH} characters. ` +
        `Shorten the server id or the tool name.`,
    );
  }
  if (!VALID_TOOL_NAME.test(finalName)) {
    throw new Error(
      `MCP tool name "${finalName}" must match /^[a-zA-Z0-9_-]+$/. ` +
        `Server id and tool name may only contain letters, digits, "_", or "-".`,
    );
  }

  const tool: JsonSchemaToolDef = {
    description: descriptor.description ?? descriptor.name,
    jsonSchema: descriptor.inputSchema,
    execute: (args) => callTool(descriptor.name, args ?? {}),
  };

  return { name: finalName, tool };
}
