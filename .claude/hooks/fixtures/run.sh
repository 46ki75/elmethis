#!/usr/bin/env bash
# Test harness for the Claude Code hooks one level up (lefthook-fmt.sh,
# lefthook-check.sh). Pipes each stub payload in this directory into the
# matching hook and prints the hook's exit code plus any stdout — for the Stop
# hook, stdout is the JSON `{decision: "block", ...}` it would feed back to
# Claude; the fmt hook is silent on success.
#
# Stub payloads use the literal token __PROJECT_DIR__ wherever Claude Code would
# pass an absolute path. We substitute the real project dir before piping and
# export CLAUDE_PROJECT_DIR so the hooks resolve the repo deterministically.
#
# Usage:
#   .claude/hooks/fixtures/run.sh                     # run every stub
#   .claude/hooks/fixtures/run.sh stop-inactive.json  # run one stub
set -uo pipefail

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
hooks_dir="$(cd "$dir/.." && pwd)"
proj="${CLAUDE_PROJECT_DIR:-$(cd "$hooks_dir/../.." && pwd)}"
export CLAUDE_PROJECT_DIR="$proj"

run_one() {
  local stub="$1" name hook out status
  name="$(basename "$stub")"
  case "$name" in
    fmt-*) hook="$hooks_dir/lefthook-fmt.sh" ;;
    stop-*) hook="$hooks_dir/lefthook-check.sh" ;;
    *)
      printf '\n=== %s -> (no hook mapping, skipped) ===\n' "$name"
      return
      ;;
  esac

  printf '\n=== %s -> %s ===\n' "$name" "$(basename "$hook")"
  out="$(sed "s#__PROJECT_DIR__#$proj#g" "$stub" | "$hook")"
  status=$?
  printf 'exit: %d\n' "$status"
  [ -n "$out" ] && printf 'stdout:\n%s\n' "$out"
}

if [ "$#" -gt 0 ]; then
  for f in "$@"; do run_one "$dir/$f"; done
else
  for f in "$dir"/fmt-*.json "$dir"/stop-*.json; do run_one "$f"; done
fi
