import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function createCodexModelCatalog(model: {
  slug: string;
  display_name: string;
}): { path: string; close(): void } {
  const directory = mkdtempSync(join(tmpdir(), "elmethis-plan-model-"));
  const path = join(directory, "models.json");
  try {
    writeFileSync(
      path,
      JSON.stringify({
        models: [
          {
            supported_reasoning_levels: [],
            model_messages: {
              instructions_template: "You are a helpful assistant.",
            },
            visibility: "list",
            supported_in_api: true,
            priority: 0,
            support_verbosity: false,
            truncation_policy: { mode: "bytes", limit: 10000 },
            ...model,
            // This is wire-format selection, not a model-entitlement claim. In the
            // pinned CLI, Responses Lite moves tools into additional_tools input
            // and puts instructions in developer messages, as SIWC requires.
            // https://github.com/openai/codex/blob/rust-v0.163.0/codex-rs/core/src/client.rs
            use_responses_lite: true,
            supports_search_tool: false,
            tool_mode: "direct",
            shell_type: "disabled",
            apply_patch_tool_type: null,
            experimental_supported_tools: [],
          },
        ],
      }),
      { mode: 0o600, flag: "wx" },
    );
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
  return {
    path,
    close: () => rmSync(directory, { recursive: true, force: true }),
  };
}
