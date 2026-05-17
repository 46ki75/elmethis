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
 * Transport-agnostic handle the rest of the system uses to talk to an
 * MCP server. Produced by `createMcpClient` (production) or by a test
 * double.
 */
export interface McpClientHandle {
  listTools: () => Promise<McpToolDescriptor[]>;
  callTool: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<unknown>;
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
