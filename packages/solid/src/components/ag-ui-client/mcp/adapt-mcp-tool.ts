import type { AnyToolDef, JsonSchemaToolDef } from "../internal/tool-registry";
import type { McpToolDescriptor } from "./mcp-types";

const MAX_TOOL_NAME_LENGTH = 64;
const VALID_TOOL_NAME = /^[a-zA-Z0-9_-]+$/;

export interface AdaptMcpToolOptions {
  prefix?: string;
}

export function adaptMcpTool(
  descriptor: McpToolDescriptor,
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>,
  options: AdaptMcpToolOptions = {},
): { name: string; tool: AnyToolDef } {
  const name =
    options.prefix === undefined
      ? descriptor.name
      : `${options.prefix}__${descriptor.name}`;
  if (name.length > MAX_TOOL_NAME_LENGTH) {
    throw new Error(
      `MCP tool name "${name}" exceeds ${MAX_TOOL_NAME_LENGTH} characters. Shorten the server id or the tool name.`,
    );
  }
  if (!VALID_TOOL_NAME.test(name)) {
    throw new Error(
      `MCP tool name "${name}" must match /^[a-zA-Z0-9_-]+$/. Server id and tool name may only contain letters, digits, "_", or "-".`,
    );
  }

  const tool: JsonSchemaToolDef = {
    description: descriptor.description ?? descriptor.name,
    jsonSchema: descriptor.inputSchema,
    execute: (args) => callTool(descriptor.name, args ?? {}),
  };
  return { name, tool };
}
