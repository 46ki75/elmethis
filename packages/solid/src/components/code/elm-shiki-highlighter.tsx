import type { JSX } from "@solidjs/web";
import { createDeferred, Loading, omit, onCleanup } from "solid-js";
import { clsx } from "clsx";
import type { BundledLanguage, ThemeRegistrationRaw } from "shiki";

import styles from "./elm-shiki-highlighter.module.css";

/* oxlint-disable solid/no-innerhtml -- Shiki escapes source code before producing this markup. */

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
  if (normalized in bundledLanguages) {
    return normalized as BundledLanguage;
  }
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
    if (isStale()) {
      return escapeHtml(code);
    }
    const resolvedLanguage = resolveLanguage(language, shiki.bundledLanguages);
    return await shiki.codeToHtml(code, {
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
  } catch {
    return escapeHtml(code);
  }
};

export const ElmShikiHighlighter = (props: ElmShikiHighlighterProps) => {
  const rest = omit(props, "class", "code", "language");
  let generation = 0;
  const rawHtml = createDeferred(() => {
    const code = props.code;
    const request = ++generation;
    // Solid discards obsolete results; skip the Shiki work as well if its
    // runtime was still loading when the input changed.
    return code
      ? highlightCode(
          code,
          props.language ?? "txt",
          () => request !== generation,
        )
      : "";
  });
  onCleanup(() => {
    generation++;
  });

  return (
    <Loading
      fallback={
        <pre
          {...rest}
          class={clsx(styles["elm-shiki-highlighter"], props.class)}
          innerHTML={escapeHtml(props.code)}
        />
      }
    >
      <pre
        {...rest}
        class={clsx(styles["elm-shiki-highlighter"], props.class)}
        innerHTML={rawHtml()}
      />
    </Loading>
  );
};
