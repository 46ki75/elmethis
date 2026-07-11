// Claude Code Stop hook: run lefthook's `check` command over the files changed
// in the working tree. On failure, block the stop and feed the output back so
// Claude fixes the issues. `stop_hook_active` guards against an infinite loop:
// the second time we're invoked (because we blocked once), we just allow stop.
import { spawnSync } from "node:child_process";
import process from "node:process";

interface StopInput {
  stop_hook_active?: boolean;
}

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk as Buffer);

let input: StopInput = {};
try {
  input = JSON.parse(Buffer.concat(chunks).toString("utf8")) as StopInput;
} catch {
  process.exit(0);
}
if (input.stop_hook_active === true) process.exit(0);

const proj = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const git = (...args: string[]): string[] => {
  const res = spawnSync("git", args, { cwd: proj, encoding: "utf8" });
  return res.status === 0 && res.stdout ? res.stdout.split("\n") : [];
};

// Changed (added/modified, not deleted) + untracked files vs HEAD.
const files = [
  ...new Set([
    ...git("diff", "--name-only", "--diff-filter=d", "HEAD"),
    ...git("ls-files", "--others", "--exclude-standard"),
  ]),
]
  .filter(Boolean)
  .sort();
if (files.length === 0) process.exit(0);

// NO_COLOR + the ANSI strip below keep the fed-back text clean; we capture all
// output and only surface it on failure (lefthook.yml uses output:
// [failure, summary], so a failing run also carries lefthook's own summary).
const res = spawnSync(
  "pnpm",
  ["exec", "lefthook", "run", "check", ...files.flatMap((f) => ["--file", f])],
  { cwd: proj, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
);
if (res.status === 0) process.exit(0);

// Strip any ANSI a tool emitted on its own; never block with an empty reason.
// eslint-disable-next-line no-control-regex
let raw = `${res.stdout ?? ""}${res.stderr ?? ""}`.replace(
  /\x1b\[[0-9;]*m/g,
  "",
);
if (raw.trim() === "") raw = `lefthook run check exited ${res.status}`;

console.log(
  JSON.stringify({
    decision: "block",
    reason: `\`lefthook run check\` failed — fix these before stopping:\n\n${raw}`,
  }),
);
process.exit(0);
