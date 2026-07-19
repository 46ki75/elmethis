import {
  createResource,
  mergeProps,
  onCleanup,
  splitProps,
  Suspense,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";
import type { BundledLanguage, ThemeRegistrationRaw } from "shiki";
import ikumaDark from "@46ki75/ikuma-theme/dark";
import ikumaLight from "@46ki75/ikuma-theme/light";

import styles from "./elm-shiki-highlighter.module.css";

/* eslint-disable solid/no-innerhtml -- Shiki escapes source code before producing this markup. */

export interface ElmShikiHighlighterProps extends JSX.HTMLAttributes<HTMLPreElement> {
  /** The code to display. */
  code: string;

  /** The language of the code. Defaults to plaintext. */
  language?: string;
}

let shikiPromise: Promise<typeof import("shiki")> | undefined;
const loadShiki = () =>
  (shikiPromise ??= import("shiki").catch((error: unknown) => {
    shikiPromise = undefined;
    throw error;
  }));

const resolveLanguage = (
  language: string,
  bundledLanguages: Record<string, unknown>,
): BundledLanguage | "text" => {
  const normalized = language.trim().toLowerCase();
  if (normalized in bundledLanguages) return normalized as BundledLanguage;
  return "text";
};

const escapeHtml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

const highlightCode = async (
  code: string,
  language: string,
  isStale: () => boolean,
): Promise<string> => {
  let highlighter:
    | Awaited<ReturnType<(typeof import("shiki"))["createHighlighter"]>>
    | undefined;

  try {
    const { bundledLanguages, createHighlighter } = await loadShiki();
    if (isStale()) return escapeHtml(code);

    const resolvedLanguage = resolveLanguage(language, bundledLanguages);
    highlighter = await createHighlighter({
      themes: [
        ikumaDark as unknown as ThemeRegistrationRaw,
        ikumaLight as unknown as ThemeRegistrationRaw,
      ],
      langs: resolvedLanguage === "text" ? [] : [resolvedLanguage],
    });

    if (isStale()) return escapeHtml(code);

    return highlighter.codeToHtml(code, {
      lang: resolvedLanguage,
      themes: {
        dark: ikumaDark as unknown as ThemeRegistrationRaw,
        light: ikumaLight as unknown as ThemeRegistrationRaw,
      },
      defaultColor: false,
      colorReplacements: {
        "#ffffff": "transparent",
        "#121212": "transparent",
      },
    });
  } catch {
    return `<pre>${escapeHtml(code)}</pre>`;
  } finally {
    highlighter?.dispose();
  }
};

export const ElmShikiHighlighter = (props: ElmShikiHighlighterProps) => {
  const merged = mergeProps({ language: "txt" }, props);
  const [local, rest] = splitProps(merged, ["class", "code", "language"]);
  let generation = 0;
  const [rawHtml] = createResource(
    () => {
      const code = local.code;
      const language = local.language;
      const currentGeneration = ++generation;

      return code ? { code, language, generation: currentGeneration } : false;
    },
    ({ code, language, generation: requestGeneration }) =>
      highlightCode(code, language, () => requestGeneration !== generation),
  );

  onCleanup(() => {
    generation += 1;
  });

  return (
    <Suspense
      fallback={
        <pre
          {...rest}
          class={clsx(styles["elm-shiki-highlighter"], local.class)}
          innerHTML={escapeHtml(local.code)}
        />
      }
    >
      <pre
        {...rest}
        class={clsx(styles["elm-shiki-highlighter"], local.class)}
        innerHTML={rawHtml() ?? ""}
      />
    </Suspense>
  );
};
