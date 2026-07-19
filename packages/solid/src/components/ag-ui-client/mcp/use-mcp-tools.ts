import { createSignal, type Accessor } from "solid-js";

import type { ToolRegistry } from "../internal/tool-registry";
import { adaptMcpTool } from "./adapt-mcp-tool";
import type {
  McpClientHandle,
  McpServerConfig,
  McpServerStatus,
} from "./mcp-types";
import { useMcpConnections } from "./use-mcp-connections";
import { validateServers } from "./validate-servers";

export interface UseMcpToolsOptions {
  servers: McpServerConfig[];
  prefixNames?: boolean;
  clientFactory?: (config: McpServerConfig) => Promise<McpClientHandle>;
}

export interface UseMcpToolsReturn {
  tools: Accessor<ToolRegistry>;
  status: Record<string, McpServerStatus>;
  reconnect: (id?: string) => Promise<void>;
}

export function useMcpTools(options: UseMcpToolsOptions): UseMcpToolsReturn {
  validateServers(options.servers);
  const shouldPrefix = options.prefixNames !== false;
  const [tools, setTools] = createSignal<ToolRegistry>({});

  const onConnect = async (
    config: McpServerConfig,
    handle: McpClientHandle,
  ) => {
    const descriptors = await handle.listTools();
    const next = { ...tools() };
    for (const descriptor of descriptors) {
      const adapted = adaptMcpTool(
        descriptor,
        (name, args) => handle.callTool(name, args),
        shouldPrefix ? { prefix: config.id } : undefined,
      );
      next[adapted.name] = adapted.tool;
    }
    setTools(next);
    return descriptors.length;
  };

  const dropToolsFor = (id: string) => {
    const prefix = shouldPrefix ? `${id}__` : undefined;
    if (!prefix) return;
    setTools(
      Object.fromEntries(
        Object.entries(tools()).filter(([name]) => !name.startsWith(prefix)),
      ),
    );
  };

  const { status, reconnect } = useMcpConnections({
    servers: options.servers,
    clientFactory: options.clientFactory,
    onConnect,
    onReconnectDrop: dropToolsFor,
  });
  return { tools, status, reconnect };
}
