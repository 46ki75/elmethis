import type { McpServerConfig } from "./mcp-types";

export const VALID_SERVER_ID = /^[a-zA-Z0-9_-]+$/;

export function validateServers(servers: McpServerConfig[]): void {
  const seen = new Set<string>();
  for (const server of servers) {
    if (!VALID_SERVER_ID.test(server.id)) {
      throw new Error(
        `MCP server id "${server.id}" must match /^[a-zA-Z0-9_-]+$/.`,
      );
    }
    if (seen.has(server.id)) {
      throw new Error(`Duplicate MCP server id: "${server.id}".`);
    }
    seen.add(server.id);
  }
}
