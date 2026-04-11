export const LANGUAGES = [
  "rust",
  "javascript",
  "typescript",
  "shell",
  "terraform",
  "html",
  "css",
  "npm",
  "java",
  "kotlin",
  "go",
  "python",
  "sql",
  "json",
  "lua",
  "csharp",
  "cpp",
  "c",
  "file",
] as const;

export type Language = (typeof LANGUAGES)[number];
