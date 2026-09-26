import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { test } from "node:test";
import { CODEX_CONFIG, codexProcessOptions } from "./codex-config.ts";

void test("uses a private login store and excludes inherited API credentials", () => {
  const home = mkdtempSync(join(tmpdir(), "elmethis-codex-config-"));
  const keys = [
    "COPILOTKIT_CODEX_HOME",
    "CODEX_HOME",
    "OPENAI_API_KEY",
    "CODEX_API_KEY",
    "OPENAI_BASE_URL",
  ];
  const previous = keys.map((key) => process.env[key]);
  try {
    process.env.COPILOTKIT_CODEX_HOME = home;
    process.env.CODEX_HOME = "/personal/codex";
    process.env.OPENAI_API_KEY = "test-key";
    process.env.CODEX_API_KEY = "test-key";
    process.env.OPENAI_BASE_URL = "https://example.com";
    const options = codexProcessOptions();
    assert.equal(options.env.CODEX_HOME, home);
    assert.equal(options.cwd, join(home, "workspace"));
    // SIGKILL cannot be forwarded by the npm Node launcher. The owned child
    // must be the native binary so transport escalation actually terminates it.
    assert.equal(
      basename(options.command),
      process.platform === "win32" ? "codex.exe" : "codex",
    );
    assert.deepEqual(options.args, []);
    assert.equal(options.env.OPENAI_API_KEY, undefined);
    assert.equal(options.env.CODEX_API_KEY, undefined);
    assert.equal(options.env.OPENAI_BASE_URL, undefined);
    assert.equal(process.env.OPENAI_API_KEY, "test-key");
    assert.ok(CODEX_CONFIG.includes('forced_login_method="chatgpt"'));
    assert.ok(CODEX_CONFIG.includes("features.shell_tool=false"));
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[index];
      }
    });
    rmSync(home, { recursive: true, force: true });
  }
});
