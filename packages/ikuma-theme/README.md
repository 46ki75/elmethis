# Ikuma Theme

Ikuma Theme provides dark and light themes for VS Code, Neovim, OpenCode, Shiki,
Windows Terminal, and Ghostty.

## VS Code

Install the `46ki75.ikuma-theme` extension from the VS Code Marketplace, then
select either **Ikuma Theme Dark** or **Ikuma Theme Light**.

## Neovim

From the repository root, generate the themes and copy the standalone Lua
colorscheme into your Neovim configuration:

```sh
pnpm --filter ikuma-theme run build:theme
mkdir -p ~/.config/nvim/colors
cp packages/ikuma-theme/dist/neovim/colors/ikuma.lua ~/.config/nvim/colors/ikuma.lua
```

If your configuration lives elsewhere, use the directory reported by
`:lua print(vim.fn.stdpath("config"))` instead of `~/.config/nvim`.

Add this to `init.lua`:

```lua
vim.opt.termguicolors = true
vim.opt.background = "dark" -- or "light"
vim.cmd.colorscheme("ikuma")
```

The colorscheme includes editor UI, standard syntax highlighting, Tree-sitter
captures, LSP semantic tokens, diagnostics, diffs, and terminal colors. Changing
`:set background=light` or `:set background=dark` automatically reloads the
matching palette. Terminal colors apply to newly opened terminal buffers.

After changing the shared palette, regenerate and copy the file again, then run
`:colorscheme ikuma` to reload it.

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

## Ghostty

Run the build, then place the generated `dist/ghostty/Ikuma Dark` and
`dist/ghostty/Ikuma Light` files in `~/.config/ghostty/themes/`. Select both
variants in `~/.config/ghostty/config` to follow the system appearance:

```ini
theme = light:Ikuma Light,dark:Ikuma Dark
```

Reload the Ghostty configuration after changing the theme.

## Development

`pnpm --filter ikuma-theme run build` generates the VS Code theme, Neovim
colorscheme, OpenCode theme, Shiki package, Windows Terminal scheme, Ghostty
themes, and VSIX. Edit `scripts/colors.ts` to change the shared palette and
semantic color assignments.
