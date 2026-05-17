import type {
  McpClientHandle,
  McpPromptDescriptor,
  McpPromptResult,
  McpServerConfig,
  McpToolDescriptor,
} from "./mcp-types";

/**
 * Identity the MCP client reports to the server during initialization.
 * The MCP spec uses this only for telemetry / logging on the server
 * side, so a stable string is fine.
 */
const CLIENT_INFO = {
  name: "@elmethis/qwik",
  version: "1.0.0",
};

/**
 * Open a Streamable HTTP connection to an MCP server and return a
 * minimal handle the rest of the system uses.
 *
 * The `@modelcontextprotocol/sdk` modules are imported lazily so they
 * are only pulled into bundles that actually call this function.
 */
export async function createMcpClient(
  cfg: McpServerConfig,
): Promise<McpClientHandle> {
  const [{ Client }, { StreamableHTTPClientTransport }] = await Promise.all([
    import("@modelcontextprotocol/sdk/client/index.js"),
    import("@modelcontextprotocol/sdk/client/streamableHttp.js"),
  ]);

  const client = new Client(CLIENT_INFO, { capabilities: {} });
  const transport = new StreamableHTTPClientTransport(new URL(cfg.url), {
    requestInit: cfg.headers ? { headers: cfg.headers } : undefined,
  });
  await client.connect(transport);

  return {
    listTools: async () => {
      const { tools } = await client.listTools();
      return tools as McpToolDescriptor[];
    },
    callTool: async (name, args) => {
      return await client.callTool({ name, arguments: args });
    },
    listPrompts: async () => {
      const { prompts } = await client.listPrompts();
      return prompts as McpPromptDescriptor[];
    },
    getPrompt: async (name, args) => {
      const result = await client.getPrompt({ name, arguments: args });
      return result as McpPromptResult;
    },
    close: async () => {
      await client.close();
    },
  };
}
