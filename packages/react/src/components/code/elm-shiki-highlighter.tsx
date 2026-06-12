import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import { clsx } from "clsx";

import styles from "./elm-shiki-highlighter.module.css";
import { codeToHtml, type ThemeRegistrationRaw } from "shiki";
import ikumaDark from "@46ki75/ikuma-theme/dark";
import ikumaLight from "@46ki75/ikuma-theme/light";

export interface ElmShikiHighlighterProps extends ComponentPropsWithoutRef<"pre"> {
  /**
   * The code to display.
   */
  code: string;

  /**
   * The language of the code.
   */
  language?: string;
}

export const ElmShikiHighlighter = ({
  className,
  code,
  language = "txt",
  ...props
}: ElmShikiHighlighterProps) => {
  const [rawHtml, setRawHtml] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      if (!code) {
        if (active) setRawHtml("");
        return;
      }

      try {
        const html = await codeToHtml(code, {
          lang: language,
          themes: {
            dark: ikumaDark as unknown as ThemeRegistrationRaw,
            light: ikumaLight as unknown as ThemeRegistrationRaw,
          },
          // Emit both `--shiki-light*` and `--shiki-dark*` custom properties
          // (instead of inlining one theme) so the CSS can resolve them with
          // native light-dark(). See elm-shiki-highlighter.module.css.
          defaultColor: false,
          colorReplacements: {
            "#ffffff": "transparent",
            "#121212": "transparent",
          },
        });
        if (active) setRawHtml(html);
      } catch {
        if (active) setRawHtml(`<pre>${code.replace(/</g, "&lt;")}</pre>`);
      }
    })();

    return () => {
      active = false;
    };
  }, [code, language]);

  return (
    <pre
      className={clsx(styles["elm-shiki-highlighter"], className)}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
      {...props}
    />
  );
};
