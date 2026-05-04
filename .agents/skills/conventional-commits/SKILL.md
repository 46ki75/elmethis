---
name: conventional-commits
description: >
  Write, format, and review conventional commit messages following the
  Conventional Commits 1.0.0 spec and this project's house rules. Use this
  skill whenever the user asks you to write a commit message, format or fix
  a commit message, check whether a commit message is valid, explain the
  commit convention, suggest a type or scope, or describe what changes to
  make before committing. Trigger even when the user doesn't say "conventional
  commits" explicitly — phrases like "how should I word this commit", "what
  type is this", "write a commit for", "is this commit message ok", or just
  pasting a raw description and asking for a commit all count.
license: MIT
metadata:
  author: "Ikuma Yamashita"
  version: "1.0"
---

# Conventional Commits Skill

Help the user produce correct, clear conventional commit messages for this
project. You should write the message, explain your choices, and flag
anything that needs the user's input (e.g. the right scope word, whether a
change is breaking).

---

## Message format

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- The **header** (first line) is required. Body and footers are optional, each
  separated from the previous section by **one blank line**.

---

## Allowed types

| Type       | Use it when…                                                | SemVer |
| ---------- | ----------------------------------------------------------- | ------ |
| `feat`     | a new user-facing feature or capability is added            | MINOR  |
| `fix`      | a bug is fixed (a reproducing test would now pass)          | PATCH  |
| `refactor` | internal code change with zero behavior change              | —      |
| `docs`     | documentation only (README, comments, guides, ADRs)         | —      |
| `test`     | tests added or updated, no `src` changes                    | —      |
| `chore`    | catch-all: dep bumps, build config, CI, formatting, tooling | —      |

Pick the type that describes the **primary intent**. When in doubt, prefer
the more specific type — e.g. `refactor` over `chore` for internal rewrites.

---

## Header rules

- **Type** must be one of the six above.
- **Scope** (optional) is a short lowercase noun in parentheses:
  `fix(auth): …`, `feat(api): …`. Use a stable area-of-the-codebase noun.
  Don't use issue IDs as scopes.
- **Description**: imperative present tense ("add", not "added" / "adds"),
  lowercase first letter, no trailing period, ≤ 72 characters total header.
  Read it as _"This commit will…"_

---

## Breaking changes

Mark breaking changes (consumers must change code/config/env) in **either or
both** of these ways:

1. Append `!` after the type/scope: `feat(api)!: …`
2. Add a `BREAKING CHANGE:` footer (the one token allowed to contain a space):

   ```text
   BREAKING CHANGE: <what changed and what callers must do>
   ```

Breaking changes map to a **MAJOR** SemVer bump.

---

## Body (optional)

Use the body to explain **what and why** — not how (the diff shows how).

- Separate from the header with exactly one blank line.
- Wrap at 72 characters per line.
- Imperative present tense.
- Issue references belong in the footer, not here.

---

## Footer (optional)

Each footer is `Token: value` (use `-` instead of spaces in tokens).

Common footers:

- `Refs: #123` — related issue
- `Closes: #123` — closes the issue on merge
- `Co-authored-by: Name <email>`
- `BREAKING CHANGE: <description>`

---

## Merge and revert commits — the one exception

These are the **only** commits that do NOT use the `type:` prefix:

- **Merges**: keep Git's raw default subject exactly as generated (e.g.
  `Merge branch 'feature/x' into main`). Add a body only when the merge
  needs explanation (conflict decisions, etc.).
- **Reverts**: keep `git revert`'s default subject (`Revert "<original>"`),
  keep the auto-generated `This reverts commit <sha>.` body line, then add a
  body explaining **why** the revert was needed.

---

## How to apply this skill

1. **Understand the change.** Read what the user describes (or shows you in a
   diff / list of changes). Identify the primary intent, the affected area,
   and whether anything breaks for consumers.

2. **Pick the type.** Use the table above. If the change spans multiple types,
   split it or pick the dominant intent.

3. **Choose a scope** (optional). Only add one if it adds real clarity. If the
   user hasn't given you a natural scope, ask — or omit it and note that they
   can add one.

4. **Write the header.** Imperative, lowercase, ≤ 72 chars, no trailing period.

5. **Decide on body/footer.** Add a body when the _why_ isn't obvious from the
   header. Add footers for issue refs and breaking changes.

6. **Show your work briefly.** After presenting the commit message, explain in
   one or two sentences why you chose the type (and scope, if used). This helps
   the user learn the convention and spot if you misunderstood the change.

7. **Flag uncertainty.** If you're unsure about the type or scope, say so and
   offer alternatives.

---

## Examples

**Minimal:**

```text
fix: prevent crash on empty config file
```

**With scope:**

```text
feat(billing): add monthly invoice export
```

**With body and footer:**

```text
refactor(auth): extract token validation into its own module

The validation logic was duplicated across the login and refresh
handlers. Centralizing it keeps the two paths in sync and makes
future changes (e.g. adding JWKS rotation) a single edit.

Refs: #482
```

**Breaking change:**

```text
feat(api)!: require API key on all public endpoints

BREAKING CHANGE: requests without an `X-API-Key` header now
receive 401. See docs/migration-2026-05.md for migration steps.

Closes: #517
```

**Revert:**

```text
Revert "feat(billing): add monthly invoice export"

This reverts commit 3f9a1c2e.

The export job locks the invoices table for ~30s under load,
causing checkout timeouts (incident #INC-204). Reverting while
we move the export to a read replica.

Refs: #INC-204
```

---

## Quick checklist (verify before presenting)

- [ ] Type is one of: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
      (or raw Git default for merges/reverts)
- [ ] Header ≤ 72 chars, imperative, lowercase first letter, no trailing period
- [ ] Scope (if used) is a short lowercase noun in parentheses
- [ ] Breaking changes marked with `!` and/or `BREAKING CHANGE:` footer
- [ ] Body (if present) separated by a blank line, wrapped at 72 cols
- [ ] Issue refs in the footer, not the description or body
