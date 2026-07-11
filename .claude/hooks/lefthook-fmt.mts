// Claude Code PostToolUse hook (Edit|Write): format the file that was just
// edited via lefthook's `fmt` command. Non-blocking and quiet on success.
// Invoked with plain `node` — native type stripping (see .claude/settings.json).
import { spawnSync } from "node:child_process";
import process from "node:process";

interface PostToolUseInput {
  tool_input?: { file_path?: string };
}

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk as Buffer);

let file: string | undefined;
try {
  file = (
    JSON.parse(Buffer.concat(chunks).toString("utf8")) as PostToolUseInput
  ).tool_input?.file_path;
} catch {
  process.exit(0);
}
if (!file) process.exit(0);

const proj = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

// Only format files inside this repo (Edit may target other working dirs).
if (!file.startsWith(`${proj}/`)) process.exit(0);

// lefthook scopes to jobs whose glob matches; a non-matching file is a no-op.
spawnSync("pnpm", ["exec", "lefthook", "run", "fmt", "--file", file], {
  cwd: proj,
  env: { ...process.env, NO_COLOR: "1" },
  stdio: "ignore",
});
process.exit(0);
