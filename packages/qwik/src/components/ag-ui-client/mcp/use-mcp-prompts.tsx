import {
  $,
  useSignal,
  type NoSerialize,
  type QRL,
  type Signal,
} from "@qwik.dev/core";
import type { InputContent } from "@ag-ui/client";

import { useMcpConnections } from "./use-mcp-connections";
import { validateServers } from "./validate-servers";
import type {
  McpClientHandle,
  McpPromptDescriptor,
  McpServerConfig,
  McpServerStatus,
} from "./mcp-types";

/**
 * A prompt descriptor annotated with its source server id. The id is
 * needed by `resolve$` to know which connection to dispatch
 * `prompts/get` against — descriptors from different servers can
 * collide on `name` so the pair `(serverId, name)` is the actual key.
 */
export interface AnnotatedMcpPromptDescriptor extends McpPromptDescriptor {
  serverId: string;
}

export interface UseMcpPromptsOptions {
  /**
   * MCP servers to connect to. Read **once** at hook construction —
   * mutating this array later has no effect on existing connections.
   */
  servers: McpServerConfig[];
  /**
   * Inject an alternate client factory. Primarily for tests; default
   * is the SDK-backed `createMcpClient`. Must be wrapped in
   * `noSerialize()`.
   */
  clientFactory?: NoSerialize<
    (cfg: McpServerConfig) => Promise<McpClientHandle>
  >;
}

export interface UseMcpPromptsReturn {
  /**
   * Aggregated prompt descriptors across all ready servers, annotated
   * with their `serverId`. Starts empty and grows as each server's
   * `prompts/list` resolves.
   */
  prompts: Signal<AnnotatedMcpPromptDescriptor[]>;
  /**
   * Per-server connection status, keyed by `McpServerConfig.id`.
   */
  status: Record<string, McpServerStatus>;
  /**
   * Fetch a prompt from its source server with the given string
   * arguments and convert the response's message blocks into
   * `InputContent[]` that can be fed straight into `useAgent.send$`.
   *
   * Resolves to `null` when:
   * - the server connection is not (or no longer) open,
   * - or the server replied but the response contained no usable
   *   text content.
   */
  resolve$: QRL<
    (
      serverId: string,
      name: string,
      args: Record<string, string>,
    ) => Promise<InputContent[] | null>
  >;
}

/**
 * Connect to one or more MCP servers over Streamable HTTP, list their
 * prompts, and surface them as a single annotated list plus a
 * `resolve$` QRL that renders one of them into `InputContent[]`.
 *
 * Mirrors `useMcpTools` in shape — both sit on the shared
 * `useMcpConnections` lifecycle. The two hooks open independent
 * connections; a shared-connection variant can come later if needed.
 *
 * @example
 * ```tsx
 * const { prompts, resolve$ } = useMcpPrompts({
 *   servers: [{ id: "weather", url: mcpUrl }],
 * });
 *
 * const onPick = $(async (p: AnnotatedMcpPromptDescriptor) => {
 *   const content = await resolve$(p.serverId, p.name, {});
 *   if (content) await send$(content);
 * });
 * ```
 *
 * @remarks
 * **MCP argument schema is intentionally minimal.** The MCP spec's
 * `PromptArgument` only carries `name`, `description`, and `required`
 * (see `@modelcontextprotocol/sdk` `PromptArgumentSchema` —
 * a plain `z.object` with no `.passthrough()`, so any extra fields a
 * server attaches are silently stripped by the client). That means:
 *
 * - **No enum, no regex, no min/max** rides the wire. `ElmAgUiPromptArgument`
 *   has `enum` / `pattern` / `patternMessage` fields, but nothing in
 *   this hook populates them from the MCP response.
 * - **Validation errors come back as raw Zod issues.** When the server
 *   rejects an argument, the failure surfaces as the JSON-RPC error
 *   payload (e.g. `MCP error -32602: Invalid arguments for prompt X:
 *   [ { "validation": "regex", "code": "invalid_string", ... } ]`).
 *   The picker's modal renders that string verbatim — it is not a
 *   human-friendly message.
 *
 * If your end users will ever see this UI, treat MCP prompts as a
 * developer-facing surface and ship hand-tuned templates in the
 * production app instead. For internal / power-user surfaces, you can
 * paper over the constraints by reshaping descriptors at the mapping
 * layer (inject `enum` / `pattern` based on out-of-band knowledge of
 * the server's Zod schemas).
 */
export function useMcpPrompts(
  options: UseMcpPromptsOptions,
): UseMcpPromptsReturn {
  const { servers, clientFactory } = options;
  validateServers(servers);

  const prompts = useSignal<AnnotatedMcpPromptDescriptor[]>([]);

  // Replace this server's entries while keeping others intact — each
  // connection lists independently per server.
  const onConnect = async (cfg: McpServerConfig, handle: McpClientHandle) => {
    const descriptors = await handle.listPrompts();
    const annotated: AnnotatedMcpPromptDescriptor[] = descriptors.map((d) => ({
      ...d,
      serverId: cfg.id,
    }));
    prompts.value = [
      ...prompts.value.filter((p) => p.serverId !== cfg.id),
      ...annotated,
    ];
    return descriptors.length;
  };

  const { status, getHandle$ } = useMcpConnections({
    servers,
    clientFactory,
    onConnect,
  });

  const resolve$ = $(
    async (
      serverId: string,
      name: string,
      args: Record<string, string>,
    ): Promise<InputContent[] | null> => {
      const handle = await getHandle$(serverId);
      if (!handle) return null;
      const result = await handle.getPrompt(name, args);
      const content: InputContent[] = [];
      for (const message of result.messages) {
        if (
          message.content?.type === "text" &&
          typeof (message.content as { text?: unknown }).text === "string"
        ) {
          content.push({
            type: "text",
            text: (message.content as { text: string }).text,
          });
        }
      }
      return content.length > 0 ? content : null;
    },
  );

  return { prompts, status, resolve$ };
}
