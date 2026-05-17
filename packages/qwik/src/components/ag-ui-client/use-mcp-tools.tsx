import {
  $,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type NoSerialize,
  type QRL,
  type Signal,
} from "@qwik.dev/core";

import { adaptMcpTool } from "./adapt-mcp-tool";
import { createMcpClient } from "./create-mcp-client";
import type {
  McpClientHandle,
  McpServerConfig,
  McpServerStatus,
} from "./mcp-types";
import type { ToolRegistry } from "./tool-registry";

// The server id flows into surfaced tool names via the `${id}__`
// prefix. Some LLM runtimes parse tool calls on `.` / `:` boundaries
// and OpenAI caps the combined name at 64 chars — restricting ids to
// `[a-zA-Z0-9_-]` keeps the prefixed names parseable everywhere.
const VALID_SERVER_ID = /^[a-zA-Z0-9_-]+$/;

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

function validateServers(servers: McpServerConfig[]): void {
  const seen = new Set<string>();
  for (const s of servers) {
    if (!VALID_SERVER_ID.test(s.id)) {
      throw new Error(
        `MCP server id "${s.id}" must match /^[a-zA-Z0-9_-]+$/.`,
      );
    }
    if (seen.has(s.id)) {
      throw new Error(`Duplicate MCP server id: "${s.id}".`);
    }
    seen.add(s.id);
  }
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
export function useMcpTools(
  options: UseMcpToolsOptions,
): UseMcpToolsReturn {
  const { servers, clientFactory } = options;
  validateServers(servers);

  const tools = useSignal<NoSerialize<ToolRegistry> | undefined>(
    noSerialize<ToolRegistry>({}),
  );
  const status = useStore<Record<string, McpServerStatus>>(
    Object.fromEntries(
      servers.map((s) => [s.id, { state: "connecting" }]),
    ),
  );
  // Wrap in a Signal so Qwik's optimizer can serialize this primitive
  // into the visible-task closure unambiguously.
  const shouldPrefixRef = useSignal<boolean>(options.prefixNames !== false);

  // Snapshot of the server set captured at construction. Stored in a
  // signal so closures inside `useVisibleTask$` and `reconnect$` see
  // the same array.
  const serversRef = useSignal<NoSerialize<McpServerConfig[]>>(
    noSerialize(servers),
  );
  // Lazy-init wrapper: useSignal treats a bare function initial value
  // as a deferred initializer and would invoke createMcpClient() with
  // no args. Returning it from `() => ...` stores the function itself.
  const factoryRef = useSignal<
    NoSerialize<(cfg: McpServerConfig) => Promise<McpClientHandle>>
  >(() => clientFactory ?? noSerialize(createMcpClient));

  // Holds the imperative reconnect implementation, installed by the
  // visible task below. `reconnect$` is the public QRL wrapper that
  // delegates to it.
  const reconnectOp = useSignal<
    NoSerialize<(id?: string) => Promise<void>> | undefined
  >(undefined);

  // Why useVisibleTask$ (not useTask$)?
  //   1. The MCP SDK transport uses browser-only APIs (`fetch`
  //      streaming bodies, `EventSource`-style reads) — opening a
  //      connection during SSR would either error out or open a
  //      socket from the server process that the resumed client can
  //      never close.
  //   2. The `McpClientHandle` it produces is `noSerialize`d, so any
  //      value constructed on the server would be `undefined` after
  //      resume regardless.
  // `document-ready` strategy starts the connect fan-out as soon as
  // the DOM is parsed rather than waiting for the host element to
  // become visible — MCP latency dominates tool availability, and we
  // want the agent to see tools the moment the user types.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      // Live SDK handles, keyed by server id. Kept in the closure
      // (not a signal) because they're non-serializable instances
      // and only this task and its `cleanup` need to reach them.
      const handles = new Map<string, McpClientHandle>();

      const open = async (cfg: McpServerConfig) => {
        const factory = factoryRef.value;
        if (!factory) return;
        status[cfg.id] = { state: "connecting" };
        try {
          const handle = await factory(cfg);
          handles.set(cfg.id, handle);
          const descriptors = await handle.listTools();
          const next: ToolRegistry = { ...(tools.value ?? {}) };
          for (const descriptor of descriptors) {
            const { name, tool } = adaptMcpTool(
              descriptor,
              (toolName, args) => handle.callTool(toolName, args),
              shouldPrefixRef.value ? { prefix: cfg.id } : undefined,
            );
            next[name] = tool;
          }
          tools.value = noSerialize(next);
          status[cfg.id] = {
            state: "ready",
            toolCount: descriptors.length,
          };
        } catch (err) {
          status[cfg.id] = {
            state: "error",
            error: err instanceof Error ? err.message : String(err),
          };
        }
      };

      const close = async (id: string) => {
        const handle = handles.get(id);
        if (!handle) return;
        handles.delete(id);
        try {
          await handle.close();
        } catch {
          // server already closed; swallow
        }
      };

      const dropToolsFor = (id: string) => {
        const current = (tools.value ?? {}) as ToolRegistry;
        const prefix = shouldPrefixRef.value ? `${id}__` : null;
        const next: ToolRegistry = {};
        for (const [name, def] of Object.entries(current)) {
          if (prefix && name.startsWith(prefix)) continue;
          // When `prefixNames: false`, we cannot tell which server owned
          // a tool from its name alone; leave the registry untouched
          // and document the limitation.
          next[name] = def;
        }
        tools.value = noSerialize(next);
      };

      // Install the reconnect implementation into the signal so the
      // outer `reconnect$` QRL can reach it via the resumed closure.
      // Done here (not at hook top level) because `close` / `open`
      // / `dropToolsFor` all close over `handles`, which only exists
      // inside this task.
      reconnectOp.value = noSerialize(async (id?: string) => {
        const target =
          id === undefined
            ? (serversRef.value ?? [])
            : (serversRef.value ?? []).filter((s) => s.id === id);
        await Promise.all(
          target.map(async (cfg) => {
            await close(cfg.id);
            if (shouldPrefixRef.value) dropToolsFor(cfg.id);
            await open(cfg);
          }),
        );
      });

      // Initial connection fan-out: `allSettled` (not `all`) so one
      // slow or failing server doesn't starve the others — each
      // resolves into its own `status[id]` entry independently.
      void Promise.allSettled(
        (serversRef.value ?? []).map((cfg) => open(cfg)),
      );

      cleanup(() => {
        // Drop the imperative op first so any late `reconnect$` call
        // arriving after unmount no-ops instead of touching dead
        // handles. Then close every live connection (best-effort —
        // a server that's already gone shouldn't surface here).
        reconnectOp.value = undefined;
        for (const [, handle] of handles) {
          void handle.close().catch(() => {});
        }
        handles.clear();
      });
    },
    { strategy: "document-ready" },
  );

  // Public QRL wrapper. We can't expose the imperative function
  // directly because consumers serialize the returned object across
  // resume — going through `reconnectOp.value` means the wrapper is
  // recreated lazily on the client where the visible task has
  // populated it.
  const reconnect$ = $(async (id?: string) => {
    const op = reconnectOp.value;
    if (!op) return;
    await op(id);
  });

  return { tools, status, reconnect$ };
}
