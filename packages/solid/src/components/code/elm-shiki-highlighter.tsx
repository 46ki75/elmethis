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

import styles from "./elm-shiki-highlighter.module.css";

/* eslint-disable solid/no-innerhtml -- Shiki escapes source code before producing this markup. */

export interface ElmShikiHighlighterProps extends JSX.HTMLAttributes<HTMLPreElement> {
  /** The code to display. */
  code: string;

  /** The language of the code. Defaults to plaintext. */
  language?: string;
}

let runtimePromise:
  | Promise<{
      shiki: typeof import("shiki");
      dark: ThemeRegistrationRaw;
      light: ThemeRegistrationRaw;
    }>
  | undefined;
const loadRuntime = () =>
  (runtimePromise ??= Promise.all([
    import("shiki"),
    import("@46ki75/ikuma-theme/dark"),
    import("@46ki75/ikuma-theme/light"),
  ])
    .then(([shiki, dark, light]) => ({
      shiki,
      dark: dark.default as unknown as ThemeRegistrationRaw,
      light: light.default as unknown as ThemeRegistrationRaw,
    }))
    .catch((error: unknown) => {
      runtimePromise = undefined;
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
  try {
    const { shiki, dark, light } = await loadRuntime();
    if (isStale()) return escapeHtml(code);

    const resolvedLanguage = resolveLanguage(language, shiki.bundledLanguages);
    const html = await shiki.codeToHtml(code, {
      lang: resolvedLanguage,
      themes: {
        dark,
        light,
      },
      defaultColor: false,
      colorReplacements: {
        "#ffffff": "transparent",
        "#121212": "transparent",
      },
    });

    return isStale() ? escapeHtml(code) : html;
  } catch {
    return escapeHtml(code);
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
    { ssrLoadFrom: "server" },
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
