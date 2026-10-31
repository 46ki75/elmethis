import { accessSync, constants, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);

// Match the pinned npm launcher's vendor layout, but own the native process
// directly: SIGKILL cannot be forwarded by an intermediate Node launcher.
// @openai/codex/bin/codex.js is the versioned source of this platform mapping.
function codexExecutable(): string {
  const targets: Record<string, string> = {
    "darwin-arm64": "aarch64-apple-darwin",
    "darwin-x64": "x86_64-apple-darwin",
    "linux-arm64": "aarch64-unknown-linux-musl",
    "linux-x64": "x86_64-unknown-linux-musl",
    "win32-arm64": "aarch64-pc-windows-msvc",
    "win32-x64": "x86_64-pc-windows-msvc",
  };
  const platform = `${process.platform}-${process.arch}`;
  const target = targets[platform];
  if (!target) {
    throw new Error(`Unsupported Codex platform: ${platform}`);
  }
  const codexRequire = createRequire(
    require.resolve("@openai/codex/bin/codex.js"),
  );
  const root = dirname(
    codexRequire.resolve(`@openai/codex-${platform}/package.json`),
  );
  const binary = join(
    root,
    "vendor",
    target,
    "bin",
    process.platform === "win32" ? "codex.exe" : "codex",
  );
  accessSync(binary, constants.X_OK);
  return binary;
}

// A separate login store avoids importing personal Codex MCP servers, plugins,
// and project settings. Both login and serving must use this same directory.
export const codexHome = () =>
  resolve(
    process.env.COPILOTKIT_CODEX_HOME ||
      join(homedir(), ".local/share/elmethis/copilotkit-codex"),
  );

export const CODEX_PROVIDER = "elmethis_chatgpt_plan";
export const CODEX_TOKEN_ENV = "ELMETHIS_CHATGPT_ACCESS_TOKEN";

export function codexProcessOptions(accessToken?: string) {
  const home = codexHome();
  const cwd = join(home, "workspace");
  mkdirSync(cwd, { recursive: true, mode: 0o700 });
  const env: NodeJS.ProcessEnv = { ...process.env, CODEX_HOME: home };
  // Only an app-validated SIWC grant may reach the provider. Inherited keys or
  // tokens must never silently select a different account or billing path.
  for (const name of [
    "OPENAI_API_KEY",
    "CODEX_API_KEY",
    "OPENAI_BASE_URL",
    "ACCESS_TOKEN",
    CODEX_TOKEN_ENV,
  ]) {
    delete env[name];
  }
  if (accessToken !== undefined) {
    env[CODEX_TOKEN_ENV] = accessToken;
  }
  return {
    command: codexExecutable(),
    args: [] as string[],
    cwd,
    env,
  };
}

// Verified against @openai/codex 0.163.0. Keep the CLI pinned: dynamic tools
// and raw response boundaries are experimental app-server APIs.
// https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server
export const CODEX_CONFIG = [
  'cli_auth_credentials_store="ephemeral"',
  `model_provider="${CODEX_PROVIDER}"`,
  `model_providers.${CODEX_PROVIDER}.name="ChatGPT plan"`,
  `model_providers.${CODEX_PROVIDER}.base_url="https://api.openai.com/v1"`,
  `model_providers.${CODEX_PROVIDER}.env_key="${CODEX_TOKEN_ENV}"`,
  `model_providers.${CODEX_PROVIDER}.wire_api="responses"`,
  `model_providers.${CODEX_PROVIDER}.requires_openai_auth=false`,
  `model_providers.${CODEX_PROVIDER}.supports_websockets=false`,
  `model_providers.${CODEX_PROVIDER}.supports_standalone_web_search=false`,
  'approval_policy="never"',
  // readOnly.access was removed in 0.157.1; restricted reads now require a
  // named profile: https://learn.chatgpt.com/codex/permissions
  'default_permissions="elmethis-chat"',
  'permissions.elmethis-chat.filesystem={":root"="deny"}',
  "permissions.elmethis-chat.network.enabled=false",
  "project_doc_max_bytes=0",
  "skills.include_instructions=false",
  "skills.bundled.enabled=false",
  "features.shell_tool=false",
  "features.apply_patch_freeform=false",
  "features.code_mode=false",
  "features.code_mode_only=false",
  "features.apps=false",
  "features.codex_hooks=false",
  "features.multi_agent_v2=false",
  "agents.enabled=false",
  // Responses Lite omits hosted tools. Codex standalone search instead uses
  // /v1/alpha/search, which is not a documented SIWC endpoint.
  'web_search="disabled"',
  'mcp_servers.aws-knowledge.url="https://knowledge-mcp.global.api.aws"',
];
