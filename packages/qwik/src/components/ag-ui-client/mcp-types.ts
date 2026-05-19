import type { ToolParameters } from "./tool-registry";

/**
 * Configuration for a single MCP server connection.
 *
 * - `id`: stable identifier used for tool-name prefixing and status
 *   keying. Must match `^[a-zA-Z0-9_-]+$`. Two configs sharing an id
 *   is a usage error and will throw at hook construction.
 * - `url`: Streamable HTTP endpoint of the MCP server.
 * - `headers`: optional static request headers (e.g., bearer token).
 */
export interface McpServerConfig {
  id: string;
  url: string;
  headers?: Record<string, string>;
}

/**
 * Shape of an entry in an MCP server's `tools/list` response.
 *
 * Mirrors the relevant subset of the MCP spec; full descriptors may
 * include additional fields which we ignore.
 */
export interface McpToolDescriptor {
  name: string;
  description?: string;
  inputSchema: ToolParameters;
}

/**
 * Shape of a single argument declared by an MCP `prompts/list`
 * descriptor. MCP prompt arguments are always supplied as strings —
 * the server is responsible for parsing them.
 */
export interface McpPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

/**
 * Shape of an entry in an MCP server's `prompts/list` response. Mirrors
 * the relevant subset of the MCP spec; full descriptors may include
 * additional fields which we ignore.
 */
export interface McpPromptDescriptor {
  name: string;
  description?: string;
  arguments?: McpPromptArgument[];
}

/**
 * Subset of an MCP `PromptMessage` content block the client cares about.
 * The MCP spec allows `image`, `resource`, etc. — we currently only
 * surface text blocks to the agent. Non-text blocks are dropped at
 * resolve time so the rest of the pipeline never sees them.
 */
export type McpPromptContent =
  | { type: "text"; text: string }
  | { type: string; [k: string]: unknown };

/**
 * Shape of a message returned by `prompts/get`. The MCP spec allows
 * the assistant/user role pair; we forward them to the agent's input.
 */
export interface McpPromptMessage {
  role: "user" | "assistant";
  content: McpPromptContent;
}

/**
 * Result returned by `prompts/get`.
 */
export interface McpPromptResult {
  description?: string;
  messages: McpPromptMessage[];
}

/**
 * Transport-agnostic handle the rest of the system uses to talk to an
 * MCP server. Produced by `createMcpClient` (production) or by a test
 * double.
 */
export interface McpClientHandle {
  listTools: () => Promise<McpToolDescriptor[]>;
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  listPrompts: () => Promise<McpPromptDescriptor[]>;
  getPrompt: (
    name: string,
    args: Record<string, string>,
  ) => Promise<McpPromptResult>;
  close: () => Promise<void>;
}

/**
 * Per-server connection status exposed to the consumer.
 */
export interface McpServerStatus {
  state: "connecting" | "ready" | "error";
  error?: string;
  toolCount?: number;
}
