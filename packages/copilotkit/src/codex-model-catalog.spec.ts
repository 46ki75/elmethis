import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { z } from "zod";
import { createCodexModelCatalog } from "./codex-model-catalog.ts";

void test("pins SIWC wire capabilities without changing the selected model", () => {
  const selected = {
    slug: "account-model",
    display_name: "Account model",
    context_window: 128000,
    input_modalities: ["text", "image"],
    use_responses_lite: false,
    supports_search_tool: true,
    tool_mode: "code_mode_only",
    shell_type: "default",
  };
  const catalog = createCodexModelCatalog(selected);
  const other = createCodexModelCatalog(selected);
  try {
    assert.notEqual(catalog.path, other.path);
    const parsed = z
      .object({ models: z.array(z.record(z.string(), z.unknown())) })
      .parse(JSON.parse(readFileSync(catalog.path, "utf8")));
    assert.equal(parsed.models.length, 1);
    const model = parsed.models[0];
    assert.equal(model.slug, selected.slug);
    assert.equal(model.context_window, selected.context_window);
    assert.deepEqual(model.input_modalities, selected.input_modalities);
    assert.equal(model.use_responses_lite, true);
    assert.equal(model.supports_search_tool, false);
    assert.equal(model.tool_mode, "direct");
    assert.equal(model.shell_type, "disabled");
    assert.equal(model.apply_patch_tool_type, null);
    if (process.platform !== "win32") {
      assert.equal(statSync(catalog.path).mode & 0o777, 0o600);
    }
  } finally {
    catalog.close();
    other.close();
  }
  assert.equal(existsSync(catalog.path), false);
  catalog.close();
});
