import {
  noSerialize,
  useSignal,
  type NoSerialize,
  type QRL,
  type Signal,
} from "@qwik.dev/core";

import { adaptMcpTool } from "./adapt-mcp-tool";
import { useMcpConnections } from "./use-mcp-connections";
import { validateServers } from "./validate-servers";
import type {
  McpClientHandle,
  McpServerConfig,
  McpServerStatus,
} from "./mcp-types";
import type { ToolRegistry } from "../internal/tool-registry";

export interface UseMcpToolsOptions {
  /**
   * MCP servers to connect to. Read **once** at hook construction —
   * mutating this array later has no effect on existing connections.
   * To change a server at runtime, edit the entry in place and call
   * `reconnect$(id)`, or remount the component with a new `key` to
   * fully re-run construction.
   */
  servers: McpServerConfig[];
  /**
   * When `true` (default), each tool's surfaced name is prefixed with
   * `${id}__`. Disable only when you control the entire server set
   * and have verified there are no name collisions (across servers,
   * or with locally-defined tools merged alongside).
   *
   * With prefixing off, `reconnect$(id)` cannot drop the old tools of
   * a single server, because nothing in a tool's name identifies its
   * origin — the registry is left untouched on reconnect.
   */
  prefixNames?: boolean;
  /**
   * Inject an alternate client factory. Primarily for tests; default
   * is the SDK-backed `createMcpClient`. Must be wrapped in
   * `noSerialize()` because Qwik cannot serialize a function as
   * captured state across the resume boundary.
   */
  clientFactory?: NoSerialize<
    (cfg: McpServerConfig) => Promise<McpClientHandle>
  >;
}

export interface UseMcpToolsReturn {
  /**
   * Aggregated registry across all ready servers, grown as each
   * server's `tools/list` resolves. Pass directly to
   * `useAgent({ tools })` — the agent reads `.value` at run time and
   * picks up new tools without any `useTask$` glue. Value is
   * `undefined` (or an empty registry) until the visible task has
   * had a chance to run on the client.
   */
  tools: Signal<NoSerialize<ToolRegistry> | undefined>;
  /**
   * Per-server connection status, keyed by `McpServerConfig.id`.
   * Starts as `"connecting"`, transitions to `"ready"` (with
   * `toolCount`) on success or `"error"` (with `error` message) on
   * failure. Useful for surfacing a per-server indicator in the UI.
   */
  status: Record<string, McpServerStatus>;
  /**
   * Reopen one server (by id) or all servers. Closes the existing
   * connection first, drops its tools from the registry (only
   * possible when `prefixNames` is on), then re-runs the connect /
   * list-tools flow. Resolves when the operation has settled —
   * inspect `status[id].state` for the outcome.
   */
  reconnect$: QRL<(id?: string) => Promise<void>>;
}

/**
 * Connect to one or more MCP (Model Context Protocol) servers over
 * Streamable HTTP, list their tools, and surface them as a
 * `ToolRegistry` consumable by `useAgent`. Connections live for the
 * lifetime of the component — on unmount every server connection is
 * closed automatically via the visible-task cleanup.
 *
 * The returned `tools` Signal is the single source of truth: pass it
 * straight to `useAgent({ tools })` and the agent will pick up new
 * tools as each server comes online, with no `useTask$` glue.
 *
 * @example Compose with useAgent in one line
 * ```tsx
 * const { tools: mcpTools } = useMcpTools({
 *   servers: [{ id: "fs", url: "https://my-mcp.example.com/mcp" }],
 * });
 * const agent = useAgent({ url, tools: mcpTools });
 * ```
 *
 * @example Merge MCP tools with locally-defined frontend tools
 * ```tsx
 * const { tools: mcpTools } = useMcpTools({
 *   servers: [{ id: "todo", url: mcpUrl }],
 * });
 * const merged = useSignal<NoSerialize<ToolRegistry> | undefined>();
 * useTask$(({ track }) => {
 *   const mcp = track(() => mcpTools.value);
 *   merged.value = noSerialize<ToolRegistry>({
 *     ...localTools,
 *     ...(mcp ?? {}),
 *   });
 * });
 * useAgent({ url, tools: merged });
 * ```
 *
 * @remarks
 * - Server config is read once at construction. Edits to the
 *   `servers` array after the hook returns are ignored; call
 *   `reconnect$(id)` to apply changes (e.g. rotated auth headers).
 * - v1 lists tools once per connection. The MCP
 *   `notifications/tools/list_changed` notification is **not**
 *   honored yet — servers that add tools mid-session require an
 *   explicit `reconnect$()`.
 * - Tool results from the server, including `{ isError: true }`,
 *   pass through verbatim. The AG-UI subscriber `JSON.stringify`s
 *   the value so the LLM sees the raw `{ content, isError }` shape.
 */
export function useMcpTools(options: UseMcpToolsOptions): UseMcpToolsReturn {
  const { servers, clientFactory } = options;
  validateServers(servers);
  const shouldPrefix = options.prefixNames !== false;

  const tools = useSignal<NoSerialize<ToolRegistry> | undefined>(
    noSerialize<ToolRegistry>({}),
  );

  // Merge a freshly-connected server's tools into the aggregate registry,
  // prefixing names with `${id}__` (unless disabled). The adapter's
  // `execute` calls back with the original (un-prefixed) name.
  const onConnect = async (cfg: McpServerConfig, handle: McpClientHandle) => {
    const descriptors = await handle.listTools();
    const next: ToolRegistry = { ...(tools.value ?? {}) };
    for (const descriptor of descriptors) {
      const { name, tool } = adaptMcpTool(
        descriptor,
        (toolName, args) => handle.callTool(toolName, args),
        shouldPrefix ? { prefix: cfg.id } : undefined,
      );
      next[name] = tool;
    }
    tools.value = noSerialize(next);
    return descriptors.length;
  };

  // Drop a server's tools on reconnect. Only possible when prefixing is on —
  // with `prefixNames: false` nothing in a tool's name identifies its origin,
  // so the registry is left untouched (documented limitation).
  const dropToolsFor = (id: string) => {
    const current = (tools.value ?? {}) as ToolRegistry;
    const prefix = shouldPrefix ? `${id}__` : null;
    const next: ToolRegistry = {};
    for (const [name, def] of Object.entries(current)) {
      if (prefix && name.startsWith(prefix)) continue;
      next[name] = def;
    }
    tools.value = noSerialize(next);
  };

  const { status, reconnect$ } = useMcpConnections({
    servers,
    clientFactory,
    onConnect,
    onReconnectDrop: dropToolsFor,
  });

  return { tools, status, reconnect$ };
}
