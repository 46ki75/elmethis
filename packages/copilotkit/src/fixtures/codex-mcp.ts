import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Offline native-inference fixture: no filesystem, network, or credentials.
const server = new McpServer({ name: "codex-test-fixture", version: "1.0.0" });
server.registerTool(
  "search",
  {
    description: "Search the local test fixture",
    inputSchema: { query: z.string() },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  ({ query }) => ({
    content: [{ type: "text", text: `fixture-result: ${query}` }],
  }),
);
await server.connect(new StdioServerTransport());
