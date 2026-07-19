import {
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
  type JSX,
  untrack,
} from "solid-js";
import { clsx } from "clsx";
import {
  bundledLanguages,
  createHighlighter,
  type BundledLanguage,
  type ThemeRegistrationRaw,
} from "shiki";
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

const resolveLanguage = (language: string): BundledLanguage | "text" => {
  const normalized = language.trim().toLowerCase();
  if (normalized in bundledLanguages) return normalized as BundledLanguage;
  return "text";
};

const escapeHtml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

export const ElmShikiHighlighter = (props: ElmShikiHighlighterProps) => {
  const merged = mergeProps({ language: "txt" }, props);
  const [local, rest] = splitProps(merged, ["class", "code", "language"]);
  const [rawHtml, setRawHtml] = createSignal(
    escapeHtml(untrack(() => local.code)),
  );
  let generation = 0;
  let disposed = false;

  onMount(() => {
    createEffect(() => {
      const code = local.code;
      const language = resolveLanguage(local.language);
      const currentGeneration = ++generation;

      if (!code) {
        setRawHtml("");
        return;
      }

      // Each generation owns its highlighter, including stale or unmounted work.
      void (async () => {
        let highlighter:
          Awaited<ReturnType<typeof createHighlighter>> | undefined;

        try {
          highlighter = await createHighlighter({
            themes: [
              ikumaDark as unknown as ThemeRegistrationRaw,
              ikumaLight as unknown as ThemeRegistrationRaw,
            ],
            langs: language === "text" ? [] : [language],
          });

          if (disposed || currentGeneration !== generation) return;

          const html = highlighter.codeToHtml(code, {
            lang: language,
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

          if (!disposed && currentGeneration === generation) setRawHtml(html);
        } catch {
          if (!disposed && currentGeneration === generation) {
            setRawHtml(`<pre>${escapeHtml(code)}</pre>`);
          }
        } finally {
          highlighter?.dispose();
        }
      })();
    });
  });

  onCleanup(() => {
    disposed = true;
    generation += 1;
  });

  return (
    <pre
      {...rest}
      class={clsx(styles["elm-shiki-highlighter"], local.class)}
      innerHTML={rawHtml()}
    />
  );
};
