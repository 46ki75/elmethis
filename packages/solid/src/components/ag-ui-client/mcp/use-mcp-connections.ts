import { createStore, onSettled } from "solid-js";

import { createMcpClient } from "./create-mcp-client";
import type {
  McpClientHandle,
  McpServerConfig,
  McpServerStatus,
} from "./mcp-types";

export interface UseMcpConnectionsOptions {
  servers: McpServerConfig[];
  clientFactory?: (config: McpServerConfig) => Promise<McpClientHandle>;
  onConnect: (
    config: McpServerConfig,
    handle: McpClientHandle,
  ) => Promise<number>;
  onReconnectDrop?: (id: string) => void;
}

export interface UseMcpConnectionsReturn {
  status: Record<string, McpServerStatus>;
  reconnect: (id?: string) => Promise<void>;
  getHandle: (serverId: string) => McpClientHandle | undefined;
}

export function useMcpConnections(
  options: UseMcpConnectionsOptions,
): UseMcpConnectionsReturn {
  const servers = [...options.servers];
  const [status, setStatus] = createStore<Record<string, McpServerStatus>>(
    Object.fromEntries<McpServerStatus>(
      servers.map((server) => [server.id, { state: "connecting" }]),
    ),
  );
  const handles = new Map<string, McpClientHandle>();
  let mounted = false;

  const close = async (id: string) => {
    const handle = handles.get(id);
    if (!handle) {
      return;
    }
    handles.delete(id);
    try {
      await handle.close();
    } catch {
      // The remote endpoint may already have closed the session.
    }
  };

  const open = async (config: McpServerConfig) => {
    setStatus((draft) => {
      draft[config.id] = { state: "connecting" };
    });
    try {
      const handle = await (options.clientFactory ?? createMcpClient)(config);
      if (!mounted) {
        await handle.close().catch(() => undefined);
        return;
      }
      handles.set(config.id, handle);
      const count = await options.onConnect(config, handle);
      if (mounted) {
        setStatus((draft) => {
          draft[config.id] = { state: "ready", toolCount: count };
        });
      }
    } catch (error) {
      if (mounted) {
        setStatus((draft) => {
          draft[config.id] = {
            state: "error",
            error: error instanceof Error ? error.message : String(error),
          };
        });
      }
    }
  };

  const reconnect = async (id?: string) => {
    if (!mounted) {
      return;
    }
    const targets =
      id === undefined ? servers : servers.filter((server) => server.id === id);
    await Promise.all(
      targets.map(async (config) => {
        await close(config.id);
        options.onReconnectDrop?.(config.id);
        await open(config);
      }),
    );
  };

  onSettled(() => {
    mounted = true;
    void Promise.allSettled(servers.map(open));
    return () => {
      mounted = false;
      for (const handle of handles.values()) {
        void handle.close().catch(() => undefined);
      }
      handles.clear();
    };
  });

  return {
    status,
    reconnect,
    getHandle: (serverId) => handles.get(serverId),
  };
}
