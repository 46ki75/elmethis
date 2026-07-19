/* eslint-disable solid/reactivity -- createMutable status entries update in place. */
import { onCleanup, onMount } from "solid-js";
import { createMutable } from "solid-js/store";

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
  const status = createMutable<Record<string, McpServerStatus>>(
    Object.fromEntries(
      servers.map((server) => [server.id, { state: "connecting" }]),
    ),
  );
  const handles = new Map<string, McpClientHandle>();
  let mounted = false;

  const close = async (id: string) => {
    const handle = handles.get(id);
    if (!handle) return;
    handles.delete(id);
    try {
      await handle.close();
    } catch {
      // The remote endpoint may already have closed the session.
    }
  };

  const open = async (config: McpServerConfig) => {
    status[config.id] = { state: "connecting" };
    try {
      const handle = await (options.clientFactory ?? createMcpClient)(config);
      if (!mounted) {
        await handle.close().catch(() => undefined);
        return;
      }
      handles.set(config.id, handle);
      const count = await options.onConnect(config, handle);
      if (mounted) {
        status[config.id] = { state: "ready", toolCount: count };
      }
    } catch (error) {
      if (mounted) {
        status[config.id] = {
          state: "error",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  };

  const reconnect = async (id?: string) => {
    if (!mounted) return;
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

  onMount(() => {
    mounted = true;
    void Promise.allSettled(servers.map(open));
  });
  onCleanup(() => {
    mounted = false;
    for (const handle of handles.values()) {
      void handle.close().catch(() => undefined);
    }
    handles.clear();
  });

  return {
    status,
    reconnect,
    getHandle: (serverId) => handles.get(serverId),
  };
}
