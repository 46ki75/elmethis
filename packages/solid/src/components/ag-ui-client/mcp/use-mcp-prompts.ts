import { createSignal, type Accessor } from "solid-js";
import type { InputContent } from "@ag-ui/client";

import type {
  McpClientHandle,
  McpPromptDescriptor,
  McpServerConfig,
  McpServerStatus,
} from "./mcp-types";
import { useMcpConnections } from "./use-mcp-connections";
import { validateServers } from "./validate-servers";

export interface AnnotatedMcpPromptDescriptor extends McpPromptDescriptor {
  serverId: string;
}

export interface UseMcpPromptsOptions {
  servers: McpServerConfig[];
  clientFactory?: (config: McpServerConfig) => Promise<McpClientHandle>;
}

export interface UseMcpPromptsReturn {
  prompts: Accessor<AnnotatedMcpPromptDescriptor[]>;
  status: Record<string, McpServerStatus>;
  resolve: (
    serverId: string,
    name: string,
    args: Record<string, string>,
  ) => Promise<InputContent[] | null>;
}

export function useMcpPrompts(
  options: UseMcpPromptsOptions,
): UseMcpPromptsReturn {
  validateServers(options.servers);
  const [prompts, setPrompts] = createSignal<AnnotatedMcpPromptDescriptor[]>(
    [],
  );

  const onConnect = async (
    config: McpServerConfig,
    handle: McpClientHandle,
  ) => {
    const descriptors = await handle.listPrompts();
    const annotated = descriptors.map((descriptor) => ({
      ...descriptor,
      serverId: config.id,
    }));
    setPrompts((current) => [
      ...current.filter((prompt) => prompt.serverId !== config.id),
      ...annotated,
    ]);
    return descriptors.length;
  };

  const { status, getHandle } = useMcpConnections({
    servers: options.servers,
    clientFactory: options.clientFactory,
    onConnect,
  });

  const resolve = async (
    serverId: string,
    name: string,
    args: Record<string, string>,
  ): Promise<InputContent[] | null> => {
    const handle = getHandle(serverId);
    if (!handle) return null;
    const result = await handle.getPrompt(name, args);
    const content: InputContent[] = [];
    for (const message of result.messages) {
      if (
        message.content.type === "text" &&
        typeof (message.content as { text?: unknown }).text === "string"
      ) {
        content.push({
          type: "text",
          text: (message.content as { text: string }).text,
        });
      }
    }
    return content.length > 0 ? content : null;
  };

  return { prompts, status, resolve };
}
