# Ikuma Theme

Ikuma Theme provides dark and light themes for VS Code, OpenCode, and Shiki.

## VS Code

Install the `46ki75.ikuma-theme` extension from the VS Code Marketplace, then
select either **Ikuma Theme Dark** or **Ikuma Theme Light**.

## Shiki

```ts
import ikumaDark from "@46ki75/ikuma-theme/dark";
import ikumaLight from "@46ki75/ikuma-theme/light";
```

## OpenCode

OpenCode detects the package's included `oc-themes` entry. Add it to your
`~/.config/opencode/tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["@46ki75/ikuma-theme"],
  "theme": "ikuma"
}
```

Restart OpenCode after changing TUI configuration.

## Development

`pnpm --filter ikuma-theme run build` generates the VS Code theme, OpenCode
theme, Shiki package, Windows Terminal scheme, and VSIX. Edit
`scripts/colors.ts` to change the shared palette and semantic color
assignments.
