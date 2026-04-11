// shikiInstance.ts
// @ts-expect-error - shiki is an optional peer dependency
import type { Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighterSingleton(): Promise<Highlighter> {
  if (!highlighterPromise) {
    // @ts-expect-error - shiki is an optional peer dependency
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        langs: [
          "abap",
          "bash",
          "c",
          "clojure",
          "coffeescript",
          "cpp",
          "csharp",
          "css",
          "dart",
          "diff",
          "docker",
          "elixir",
          "elm",
          "erlang",
          "fsharp",
          "gherkin",
          "glsl",
          "go",
          "graphql",
          "groovy",
          "haskell",
          "html",
          "java",
          "javascript",
          "json",
          "julia",
          "kotlin",
          "latex",
          "less",
          "lisp",
          "lua",
          "makefile",
          "markdown",
          "matlab",
          "mermaid",
          "nix",
          "objective-c",
          "ocaml",
          "pascal",
          "perl",
          "php",
          "plaintext",
          "powershell",
          "prolog",
          "protobuf",
          "python",
          "r",
          "ruby",
          "rust",
          "sass",
          "scala",
          "scheme",
          "scss",
          "shell",
          "sql",
          "swift",
          "toml",
          "typescript",
          "wasm",
          "xml",
          "yaml",
        ],
        themes: ["vitesse-light", "vitesse-dark"],
      }),
    );
  }
  return highlighterPromise;
}
