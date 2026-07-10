import { useCallback, type ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";
import { mdiDownload, mdiOpenInNew } from "@mdi/js";

import styles from "./elm-html-viewer.module.css";

import { ElmHtml, type ElmHtmlProps } from "./elm-html";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmHtmlViewerProps
  extends
    ComponentPropsWithoutRef<"figure">,
    Pick<ElmHtmlProps, "sandbox" | "autoHeight" | "allowScripts" | "height"> {
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

export const ElmHtmlViewer = ({
  className,
  html,
  src,
  filename,
  sandbox,
  autoHeight,
  allowScripts,
  height,
  ...rest
}: ElmHtmlViewerProps) => {
  const usingSrc = src !== undefined;

  const handleOpenInNewTab = useCallback(() => {
    if (usingSrc) {
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
      const serializedHtml = JSON.stringify(html ?? "").replace(/<\//g, "<\\/");
      // Matches ElmHtml's own default iframe title, so the popup stays
      // exactly as accessible as the inline preview: a <title> and `lang`
      // on the wrapper document give AT users something to announce when
      // the tab opens, and the `title` on the wrapping iframe gives it an
      // accessible name.
      const wrapper = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Embedded HTML content</title>
<style>html,body{margin:0;height:100%;}iframe{display:block;width:100%;height:100%;border:0;}</style>
</head>
<body>
<iframe sandbox title="Embedded HTML content"></iframe>
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
  }, [usingSrc, src, html]);

  const handleDownload = useCallback(() => {
    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;
    try {
      link = document.createElement("a");
      if (usingSrc) {
        link.href = src!;
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
  }, [usingSrc, src, html, filename]);

  return (
    <figure className={clsx(styles["elm-html-viewer"], className)} {...rest}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles["icon-button"]}
          onClick={handleDownload}
          aria-label="Download"
        >
          <ElmMdiIcon d={mdiDownload} size="1.25rem" />
        </button>

        <button
          type="button"
          className={styles["icon-button"]}
          onClick={handleOpenInNewTab}
          aria-label="Open in new tab"
        >
          <ElmMdiIcon d={mdiOpenInNew} size="1.25rem" />
        </button>
      </div>

      <hr className={styles.divider} />

      <div className={styles.content}>
        <ElmHtml
          html={html}
          src={src}
          sandbox={sandbox}
          autoHeight={autoHeight}
          allowScripts={allowScripts}
          height={height}
        />
      </div>
    </figure>
  );
};
