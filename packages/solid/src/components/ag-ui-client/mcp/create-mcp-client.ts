import type { McpClientHandle, McpServerConfig } from "./mcp-types";

const CLIENT_INFO = { name: "@elmethis/solid", version: "1.0.0" };

export async function createMcpClient(
  config: McpServerConfig,
): Promise<McpClientHandle> {
  const [{ Client }, { StreamableHTTPClientTransport }] = await Promise.all([
    import("@modelcontextprotocol/sdk/client/index.js"),
    import("@modelcontextprotocol/sdk/client/streamableHttp.js"),
  ]);
  const client = new Client(CLIENT_INFO, { capabilities: {} });
  const transport = new StreamableHTTPClientTransport(new URL(config.url), {
    requestInit: config.headers ? { headers: config.headers } : undefined,
  });
  await client.connect(transport);

  return {
    listTools: async () => {
      const { tools } = await client.listTools();
      return tools;
    },
    callTool: async (name, args) =>
      await client.callTool({ name, arguments: args }),
    listPrompts: async () => {
      const { prompts } = await client.listPrompts();
      return prompts;
    },
    getPrompt: async (name, args) =>
      await client.getPrompt({
        name,
        arguments: args,
      }),
    close: async () => await client.close(),
  };
}
