import { $, component$, PropsOf } from "@qwik.dev/core";
import { mdiDownload, mdiOpenInNew } from "@mdi/js";

import styles from "./elm-html-viewer.module.css";

import { ElmHtml, type ElmHtmlProps } from "./elm-html";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmHtmlViewerProps
  extends
    PropsOf<"figure">,
    Pick<ElmHtmlProps, "sandbox" | "autoHeight" | "allowScripts"> {
  /**
   * Raw HTML markup to render, and to open in a new tab or download.
   * Mutually exclusive with `src` — provide exactly one of the two.
   */
  html?: string;

  /**
   * URL of a remote document to render instead of inline `html`. Mutually
   * exclusive with `html` — provide exactly one of the two. "Open in new
   * tab" navigates straight to this URL (it's already reachable there, so
   * no blob-wrapping is needed the way inline `html` requires); "download"
   * points the download link at it directly, so whether the browser
   * actually downloads it (vs. opens it) depends on the response's own
   * headers, same as any cross-origin link.
   */
  src?: string;

  /**
   * Filename used when downloading `html`-mode content via the header's
   * download button. Ignored in `src` mode (the browser/response decide).
   * @default "download.html"
   */
  filename?: string;
}

export const ElmHtmlViewer = component$<ElmHtmlViewerProps>(
  ({
    class: className,
    html,
    src,
    filename,
    sandbox,
    autoHeight,
    allowScripts,
    ...props
  }) => {
    const handleOpenInNewTab = $(() => {
      // Recomputed here (rather than reading a shared outer `usingSrc`
      // const) because Qwik's optimizer serializes each `$()` closure's
      // captured scope independently; a derived boolean shared across two
      // closures trips `qwik/valid-lexical-scope` (it gets misclassified as
      // a non-serializable `Symbol`) even though the underlying value is a
      // plain boolean. See the `handleDownload` closure below for the same
      // pattern — [[feedback_qwik_lexical_scope_composite]].
      if (src !== undefined) {
        window.open(src, "_blank", "noreferrer");
        return;
      }
      let url: string | undefined;
      try {
        // The new tab must stay exactly as sandboxed as the inline preview:
        // wrap `html` in a script-sandboxed iframe instead of navigating the
        // tab to it directly, so an embedded <script> still can't execute.
        // `html` is injected via JSON.stringify rather than the `srcdoc`
        // attribute to avoid manual attribute-escaping bugs; "</script" is
        // escaped separately because the HTML parser looks for that literal
        // byte sequence before the wrapper's own script is parsed as JS.
        const serializedHtml = JSON.stringify(html ?? "").replace(
          /<\//g,
          "<\\/",
        );
        // Matches the `title ?? "Embedded HTML content"` fallback ElmHtml's
        // own iframe always gets, so a screen-reader user landing on this
        // new tab hears a page title and, on entering the iframe (the only
        // content on the page), a frame name — same as the inline preview.
        // This string is a fixed constant, not derived from `html`, so
        // embedding it directly as markup (rather than routing it through
        // the script like `html` itself) carries none of the
        // attribute-escaping risk that motivated the srcdoc approach above.
        const wrapperTitle = "Embedded HTML content";
        const wrapper = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${wrapperTitle}</title>
<style>html,body{margin:0;height:100%;}iframe{display:block;width:100%;height:100%;border:0;}</style>
</head>
<body>
<iframe sandbox title="${wrapperTitle}"></iframe>
<script>document.querySelector("iframe").srcdoc = ${serializedHtml};</script>
</body>
</html>`;
        url = URL.createObjectURL(new Blob([wrapper], { type: "text/html" }));
        const revoke = () => URL.revokeObjectURL(url!);
        // No "noopener": blob: URLs are only reachable from browsing contexts
        // related to the one that created them, so an opener-less window
        // can't load one at all. Dropping it is safe here because the only
        // thing smuggled into the opened document is `html` as inert JSON
        // data, never as executable script.
        const popup = window.open(url, "_blank", "noreferrer");
        if (popup) {
          popup.addEventListener("load", revoke, { once: true });
        } else {
          revoke();
        }
      } catch (error) {
        console.error("Failed to open HTML in a new tab", error);
        if (url) URL.revokeObjectURL(url);
      }
    });

    const handleDownload = $(() => {
      let url: string | undefined;
      let link: HTMLAnchorElement | undefined;
      try {
        link = document.createElement("a");
        if (src !== undefined) {
          link.href = src;
        } else {
          url = URL.createObjectURL(
            new Blob([html ?? ""], { type: "text/html" }),
          );
          link.href = url;
        }
        link.download = filename || "download.html";
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error("Failed to download HTML", error);
      } finally {
        link?.remove();
        if (url) URL.revokeObjectURL(url);
      }
    });

    return (
      <figure class={[styles["elm-html-viewer"], className]} {...props}>
        <div class={styles.header}>
          <button
            type="button"
            class={styles["icon-button"]}
            onClick$={handleDownload}
            aria-label="Download"
          >
            <ElmMdiIcon d={mdiDownload} size="1.25rem" />
          </button>

          <button
            type="button"
            class={styles["icon-button"]}
            onClick$={handleOpenInNewTab}
            aria-label="Open in new tab"
          >
            <ElmMdiIcon d={mdiOpenInNew} size="1.25rem" />
          </button>
        </div>

        <hr class={styles.divider} />

        <div class={styles.content}>
          <ElmHtml
            html={html}
            src={src}
            sandbox={sandbox}
            autoHeight={autoHeight}
            allowScripts={allowScripts}
          />
        </div>
      </figure>
    );
  },
);
