#!/usr/bin/env bash
# Claude Code PostToolUse hook (Edit|Write): format the file that was just
# edited via lefthook's `fmt` command. Non-blocking and quiet on success.
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -n "$file" ] || exit 0

proj="${CLAUDE_PROJECT_DIR:-$PWD}"

# Only format files inside this repo (Edit may target other working dirs).
case "$file" in
  "$proj"/*) ;;
  *) exit 0 ;;
esac

cd "$proj" || exit 0

# lefthook scopes to jobs whose glob matches; a non-matching file is a no-op.
NO_COLOR=1 pnpm exec lefthook run fmt --file "$file" >/dev/null 2>&1 || true
exit 0
