// Public surface of the AG-UI client feature. Re-exported here so the
// package entry (`src/index.ts`) and any in-package consumer depend on this
// barrel rather than the internal `components/ hooks/ mcp/ internal/` layout —
// future reorganizations stay contained to this folder.

// | Components |
export {
  ElmAgUiAgent,
  type ElmAgUiAgentProps,
} from "./components/elm-ag-ui-agent";
export {
  ElmAgUiInput,
  type ElmAgUiInputProps,
} from "./components/elm-ag-ui-input";
export {
  ElmAgUiPromptPicker,
  type ElmAgUiPromptPickerProps,
  type ElmAgUiPromptDescriptor,
  type ElmAgUiPromptArgument,
} from "./components/elm-ag-ui-prompt-picker";
export {
  ElmAgUiMessageRenderer,
  type ElmAgUiMessageRendererProps,
} from "./components/elm-ag-ui-message-renderer";
export {
  ElmAgUiToolExecution,
  type ElmAgUiToolExecutionProps,
} from "./components/elm-ag-ui-tool-execution";
export {
  ElmAgUiStatus,
  type ElmAgUiStatusProps,
} from "./components/elm-ag-ui-status";
export {
  ElmAgUiInputContent,
  type ElmAgUiInputContentImageProps,
} from "./components/input-content/elm-ag-ui-input-content";

// | Hooks |
export {
  useAgent,
  type AgentContext,
  type AgentState,
  type UseAgentOptions,
} from "./hooks/use-agent";

// | MCP |
export {
  useMcpTools,
  type UseMcpToolsOptions,
  type UseMcpToolsReturn,
} from "./mcp/use-mcp-tools";
export {
  useMcpPrompts,
  type UseMcpPromptsOptions,
  type UseMcpPromptsReturn,
  type AnnotatedMcpPromptDescriptor,
} from "./mcp/use-mcp-prompts";
export type {
  McpClientHandle,
  McpPromptArgument,
  McpPromptContent,
  McpPromptDescriptor,
  McpPromptMessage,
  McpPromptResult,
  McpServerConfig,
  McpServerStatus,
  McpToolDescriptor,
} from "./mcp/mcp-types";

// | Tool registry |
export {
  defineTool,
  defineJsonSchemaTool,
  type AnyToolDef,
  type JsonSchemaToolDef,
  type ToolDef,
  type ToolParameters,
  type ToolRegistry,
} from "./internal/tool-registry";
