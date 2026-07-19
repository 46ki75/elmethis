import type { ToolParameters } from "../internal/tool-registry";

export interface McpServerConfig {
  id: string;
  url: string;
  headers?: Record<string, string>;
}

export interface McpToolDescriptor {
  name: string;
  description?: string;
  inputSchema: ToolParameters;
}

export interface McpPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface McpPromptDescriptor {
  name: string;
  description?: string;
  arguments?: McpPromptArgument[];
}

export type McpPromptContent =
  { type: "text"; text: string } | { type: string; [key: string]: unknown };

export interface McpPromptMessage {
  role: "user" | "assistant";
  content: McpPromptContent;
}

export interface McpPromptResult {
  description?: string;
  messages: McpPromptMessage[];
}

export interface McpClientHandle {
  listTools: () => Promise<McpToolDescriptor[]>;
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  listPrompts: () => Promise<McpPromptDescriptor[]>;
  getPrompt: (
    name: string,
    args: Record<string, string>,
  ) => Promise<McpPromptResult>;
  close: () => Promise<void>;
}

export interface McpServerStatus {
  state: "connecting" | "ready" | "error";
  error?: string;
  toolCount?: number;
}
