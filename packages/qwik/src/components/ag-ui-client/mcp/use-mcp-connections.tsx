import {
  $,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type NoSerialize,
  type QRL,
} from "@qwik.dev/core";

import { createMcpClient } from "./create-mcp-client";
import type {
  McpClientHandle,
  McpServerConfig,
  McpServerStatus,
} from "./mcp-types";

export interface UseMcpConnectionsOptions {
  /**
   * MCP servers to connect to. Read **once** at construction — mutating
   * this array later has no effect on existing connections; use
   * `reconnect$` to apply changes.
   */
  servers: McpServerConfig[];
  /**
   * Inject an alternate client factory. Primarily for tests; default is
   * the SDK-backed `createMcpClient`. Must be wrapped in `noSerialize()`.
   */
  clientFactory?: NoSerialize<
    (cfg: McpServerConfig) => Promise<McpClientHandle>
  >;
  /**
   * Per-server hook, run inside `open()` once the connection is
   * established. Do the connection-specific listing here (e.g.
   * `tools/list` or `prompts/list`) and merge the results into the
   * caller's own signal. Return the entry count to surface as
   * `status[id].toolCount`. Throwing marks the server `"error"` with the
   * thrown message.
   */
  onConnect: (cfg: McpServerConfig, handle: McpClientHandle) => Promise<number>;
  /**
   * Per-server hook, run during `reconnect(id)` after the stale
   * connection is closed and before re-opening, so the caller can drop
   * that server's old entries. Omit when nothing needs dropping (e.g.
   * prompts are fully replaced on re-list).
   */
  onReconnectDrop?: (id: string) => void;
}

export interface UseMcpConnectionsReturn {
  /**
   * Per-server connection status, keyed by `McpServerConfig.id`. Seeded
   * `"connecting"`, transitions to `"ready"` (with `toolCount`) or
   * `"error"` (with `error`).
   */
  status: Record<string, McpServerStatus>;
  /**
   * Reopen one server (by id) or all servers: close the existing
   * connection, run `onReconnectDrop`, then re-run the connect flow.
   */
  reconnect$: QRL<(id?: string) => Promise<void>>;
  /**
   * Resolve the live handle for a server id. Client-only; `undefined`
   * before the connection opens or after unmount. Callers use it to
   * dispatch imperative requests (e.g. `prompts/get`).
   */
  getHandle$: QRL<(serverId: string) => McpClientHandle | undefined>;
}

/**
 * Shared per-server MCP connection lifecycle backing both `useMcpTools`
 * and `useMcpPrompts`. Owns the `status` store, the live handle map, the
 * connect fan-out, `reconnect`, and teardown; the only connection-specific
 * concern — what to list and where to merge it — is the caller's, supplied
 * via `onConnect`.
 *
 * Why `useVisibleTask$` (document-ready): the MCP Streamable-HTTP transport
 * uses browser-only APIs and the handles it produces are `noSerialize`d, so
 * connections must open on the client. `document-ready` starts the connect
 * fan-out as soon as the DOM is parsed rather than waiting on host
 * visibility — MCP latency dominates tool/prompt availability.
 */
export function useMcpConnections(
  options: UseMcpConnectionsOptions,
): UseMcpConnectionsReturn {
  const { servers, clientFactory, onConnect, onReconnectDrop } = options;

  const status = useStore<Record<string, McpServerStatus>>(
    Object.fromEntries(servers.map((s) => [s.id, { state: "connecting" }])),
  );

  // Snapshot of the server set, captured at construction so the visible task
  // and `reconnect$` see the same array.
  const serversRef = useSignal<NoSerialize<McpServerConfig[]>>(
    noSerialize(servers),
  );
  // Lazy-init wrappers: `useSignal` treats a bare function initial value as a
  // deferred initializer, so return the function from `() => ...` to store the
  // function itself rather than invoke it.
  const factoryRef = useSignal<
    NoSerialize<(cfg: McpServerConfig) => Promise<McpClientHandle>>
  >(() => clientFactory ?? noSerialize(createMcpClient));
  const onConnectRef = useSignal<
    NoSerialize<
      (cfg: McpServerConfig, handle: McpClientHandle) => Promise<number>
    >
  >(() => noSerialize(onConnect));
  const onReconnectDropRef = useSignal<
    NoSerialize<(id: string) => void> | undefined
  >(() => (onReconnectDrop ? noSerialize(onReconnectDrop) : undefined));

  // Imperative ops installed by the visible task (they close over the live
  // `handles` map). The public QRLs delegate through these signals so they are
  // recreated lazily on the client where the task has populated them.
  const reconnectOp = useSignal<
    NoSerialize<(id?: string) => Promise<void>> | undefined
  >(undefined);
  const getHandleOp = useSignal<
    NoSerialize<(serverId: string) => McpClientHandle | undefined> | undefined
  >(undefined);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      // Live SDK handles, keyed by server id. Kept in the closure (not a
      // signal) because they're non-serializable instances only this task and
      // its `cleanup` need to reach.
      const handles = new Map<string, McpClientHandle>();

      const open = async (cfg: McpServerConfig) => {
        const factory = factoryRef.value;
        const onConnectFn = onConnectRef.value;
        if (!factory || !onConnectFn) return;
        status[cfg.id] = { state: "connecting" };
        try {
          const handle = await factory(cfg);
          handles.set(cfg.id, handle);
          const count = await onConnectFn(cfg, handle);
          status[cfg.id] = { state: "ready", toolCount: count };
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

      reconnectOp.value = noSerialize(async (id?: string) => {
        const all = serversRef.value ?? [];
        const target = id === undefined ? all : all.filter((s) => s.id === id);
        await Promise.all(
          target.map(async (cfg) => {
            await close(cfg.id);
            onReconnectDropRef.value?.(cfg.id);
            await open(cfg);
          }),
        );
      });

      getHandleOp.value = noSerialize((serverId: string) =>
        handles.get(serverId),
      );

      // Initial connection fan-out: `allSettled` (not `all`) so one slow or
      // failing server doesn't starve the others — each resolves into its own
      // `status[id]` entry independently.
      void Promise.allSettled((serversRef.value ?? []).map((cfg) => open(cfg)));

      cleanup(() => {
        // Drop the imperative ops first so any late call arriving after
        // unmount no-ops instead of touching dead handles. Then close every
        // live connection (best-effort).
        reconnectOp.value = undefined;
        getHandleOp.value = undefined;
        for (const [, handle] of handles) {
          void handle.close().catch(() => {});
        }
        handles.clear();
      });
    },
    { strategy: "document-ready" },
  );

  // Public QRL wrappers. We can't expose the imperative functions directly
  // because consumers serialize the returned object across resume — going
  // through the op signals means each wrapper is recreated lazily on the
  // client where the visible task has populated it.
  const reconnect$ = $(async (id?: string) => {
    await reconnectOp.value?.(id);
  });

  const getHandle$ = $((serverId: string) => getHandleOp.value?.(serverId));

  return { status, reconnect$, getHandle$ };
}
