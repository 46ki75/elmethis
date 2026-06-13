import type { LanguageIcon } from "./types";

import { rust } from "./rust";
import { javascript } from "./javascript";
import { typescript } from "./typescript";
import { bash } from "./bash";
import { terraform } from "./terraform";
import { html } from "./html";
import { css } from "./css";
import { npm } from "./npm";
import { java } from "./java";
import { kotlin } from "./kotlin";
import { go } from "./go";
import { python } from "./python";
import { sql } from "./sql";
import { json } from "./json";
import { lua } from "./lua";
import { csharp } from "./c-sharp";
import { cplusplus } from "./c-plus-plus";
import { c } from "./c";

/** One language declared exactly once: its key, hints, and glyph. */
export interface LanguageEntry {
  /** Canonical language key. */
  readonly key: string;
  /** Extra hints (aliases, extensions) that normalize onto `key`; key is implicit. */
  readonly aliases: readonly string[];
  /** Authored glyph, or `null` for the generic `file` fallback. */
  readonly icon: LanguageIcon | null;
}

/**
 * The single source of truth for every language. {@link LANGUAGES},
 * {@link normalizeLanguage}, and {@link languageIcons} are all derived from
 * this array, so a language is declared in exactly one place.
 */
export const LANGUAGE_REGISTRY = [
  { key: "rust", aliases: ["rs"], icon: rust },
  { key: "javascript", aliases: ["js"], icon: javascript },
  { key: "typescript", aliases: ["ts"], icon: typescript },
  { key: "shell", aliases: ["bash", "sh"], icon: bash },
  { key: "terraform", aliases: ["tf", "hcl"], icon: terraform },
  { key: "html", aliases: ["html5"], icon: html },
  { key: "css", aliases: ["css3"], icon: css },
  { key: "npm", aliases: [], icon: npm },
  { key: "java", aliases: [], icon: java },
  { key: "kotlin", aliases: ["kt"], icon: kotlin },
  { key: "go", aliases: ["golang"], icon: go },
  { key: "python", aliases: ["py"], icon: python },
  { key: "sql", aliases: [], icon: sql },
  { key: "json", aliases: [], icon: json },
  { key: "lua", aliases: [], icon: lua },
  { key: "csharp", aliases: ["cs", "c#"], icon: csharp },
  { key: "cpp", aliases: ["c++"], icon: cplusplus },
  { key: "c", aliases: ["clang"], icon: c },
  { key: "file", aliases: [], icon: null },
] as const satisfies readonly LanguageEntry[];

/**
 * Canonical language keys. `"file"` is the generic fallback and has no glyph
 * here — consumers render it with their own code-tags icon.
 */
export type Language = (typeof LANGUAGE_REGISTRY)[number]["key"];

/** Languages that have an authored glyph (every {@link Language} except `file`). */
export type GlyphLanguage = Exclude<Language, "file">;

/** Canonical language keys, in registry order. */
export const LANGUAGES: readonly Language[] = LANGUAGE_REGISTRY.map(
  (e) => e.key,
);

const ALIAS_TO_LANGUAGE = new Map<string, Language>(
  LANGUAGE_REGISTRY.flatMap((e) => [
    [e.key, e.key] as const,
    ...e.aliases.map((a) => [a, e.key] as const),
  ]),
);

/** Maps an arbitrary language hint (alias, extension) onto a {@link Language}. */
export const normalizeLanguage = (language: string): Language =>
  ALIAS_TO_LANGUAGE.get(language) ?? "file";

/** The authored glyph artwork for every {@link GlyphLanguage}. */
export const languageIcons = Object.fromEntries(
  LANGUAGE_REGISTRY.flatMap((e) => (e.icon ? [[e.key, e.icon]] : [])),
) as Record<GlyphLanguage, LanguageIcon>;
