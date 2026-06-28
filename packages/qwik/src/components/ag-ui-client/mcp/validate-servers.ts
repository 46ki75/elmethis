import type { McpServerConfig } from "./mcp-types";

// The server id flows into surfaced tool names via the `${id}__` prefix.
// Some LLM runtimes parse tool calls on `.` / `:` boundaries and OpenAI caps
// the combined name at 64 chars — restricting ids to `[a-zA-Z0-9_-]` keeps the
// prefixed names parseable everywhere.
export const VALID_SERVER_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * Validate a server set at hook construction: every id must match
 * {@link VALID_SERVER_ID} and ids must be unique. Throws on the first
 * violation so misconfiguration surfaces immediately rather than as a runtime
 * tool-call failure. Shared by `useMcpTools` and `useMcpPrompts`.
 */
export function validateServers(servers: McpServerConfig[]): void {
  const seen = new Set<string>();
  for (const s of servers) {
    if (!VALID_SERVER_ID.test(s.id)) {
      throw new Error(`MCP server id "${s.id}" must match /^[a-zA-Z0-9_-]+$/.`);
    }
    if (seen.has(s.id)) {
      throw new Error(`Duplicate MCP server id: "${s.id}".`);
    }
    seen.add(s.id);
  }
}
