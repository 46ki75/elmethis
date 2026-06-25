#!/usr/bin/env bash
# Claude Code Stop hook: run lefthook's `check` command over the files changed
# in the working tree. On failure, block the stop and feed the output back so
# Claude fixes the issues. `stop_hook_active` guards against an infinite loop:
# the second time we're invoked (because we blocked once), we just allow stop.
set -uo pipefail

input=$(cat)
active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false')
[ "$active" = "true" ] && exit 0

proj="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$proj" || exit 0

# Changed (added/modified, not deleted) + untracked files vs HEAD.
mapfile -t files < <(
  {
    git diff --name-only --diff-filter=d HEAD
    git ls-files --others --exclude-standard
  } 2>/dev/null | sort -u
)

args=()
for f in "${files[@]}"; do
  [ -n "$f" ] && args+=(--file "$f")
done
[ ${#args[@]} -eq 0 ] && exit 0

# NO_COLOR + the ANSI strip below keep the fed-back text clean; we capture all
# output and only surface it on failure (lefthook.yml uses output:
# [failure, summary], so a failing run also carries lefthook's own summary).
raw=$(NO_COLOR=1 pnpm exec lefthook run check "${args[@]}" 2>&1)
status=$?
[ "$status" -eq 0 ] && exit 0

# Strip any ANSI a tool emitted on its own; never block with an empty reason.
raw=$(printf '%s' "$raw" | sed -E 's/\x1b\[[0-9;]*m//g')
[ -n "${raw//[$' \t\n']/}" ] || raw="lefthook run check exited $status"

jq -n --arg r "$raw" \
  '{decision: "block", reason: ("`lefthook run check` failed — fix these before stopping:\n\n" + $r)}'
exit 0
