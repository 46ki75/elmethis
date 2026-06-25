# Hook test stubs

Sample stdin payloads for the Claude Code hooks in `../`, so you can exercise
them without driving a real Claude session. Run them with the harness:

```bash
.claude/hooks/fixtures/run.sh                     # every stub
.claude/hooks/fixtures/run.sh stop-inactive.json  # one stub
```

`__PROJECT_DIR__` in a stub is a placeholder for the absolute path Claude Code
would send; `run.sh` substitutes the real repo root before piping.

## Stubs

| Stub                    | Hook                | Exercises                                            |
| ----------------------- | ------------------- | --------------------------------------------------- |
| `fmt-formattable.json`  | `lefthook-fmt.sh`   | package file → `prettier-core` formats it           |
| `fmt-non-matching.json` | `lefthook-fmt.sh`   | in-repo but no per-package fmt job matches → skipped |
| `fmt-outside-repo.json` | `lefthook-fmt.sh`   | path outside the repo → guard skips, exit 0          |
| `fmt-no-path.json`      | `lefthook-fmt.sh`   | no `tool_input.file_path` → early exit 0             |
| `stop-inactive.json`    | `lefthook-check.sh` | `stop_hook_active: false` → runs `lefthook run check` over changed files |
| `stop-active.json`      | `lefthook-check.sh` | `stop_hook_active: true` → loop guard, immediate exit 0 |

## Notes

- Both hooks always exit 0; they signal via stdout (the `block` decision),
  not the exit code — so judge `stop-*` runs by the printed JSON, not "exit 0".
- Both `fmt` and `check` only act on files under `packages/<pkg>/`; the formatter
  and linters run per-package (`root:`) so each package's own config applies.
  Edits outside a package (root files, `.claude/`) match no job and are skipped.
- The fmt hook is silent on success, and `fmt-formattable.json` targets a clean
  file so it's a no-op. To see formatting happen, add messy spacing to
  `packages/core/src/index.ts`, run `run.sh fmt-formattable.json`, then
  `git diff packages/core/src/index.ts` (and `git checkout` to restore).
- `stop-inactive.json` runs the real `check` over your current working tree, so
  its output depends on what you have changed.
