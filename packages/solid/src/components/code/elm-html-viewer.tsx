import { onCleanup, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { mdiDownload, mdiOpenInNew } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmHtml, type ElmHtmlProps } from "./elm-html";
import styles from "./elm-html-viewer.module.css";

export interface ElmHtmlViewerProps
  extends
    JSX.HTMLAttributes<HTMLElement>,
    Pick<ElmHtmlProps, "sandbox" | "autoHeight" | "allowScripts" | "height"> {
  /** Raw HTML to preview, open, and download. `src` takes precedence. */
  html?: string;

  /**
   * URL to preview directly. Open navigates directly to this URL and download
   * uses it as the anchor href without creating an intermediate Blob URL.
   */
  src?: string;

  /**
   * Suggested download filename. The default is `download.html`. This is also
   * assigned in `src` mode, but browsers may ignore the download attribute for
   * cross-origin URLs; response headers and browser policy then choose the
   * resulting filename or whether the resource opens instead.
   */
  filename?: string;
}

export const ElmHtmlViewer = (props: ElmHtmlViewerProps) => {
  const [local, rest] = splitProps(props, [
    "allowScripts",
    "autoHeight",
    "class",
    "filename",
    "height",
    "html",
    "sandbox",
    "src",
  ]);
  const pendingPopupUrls = new Set<string>();

  const revokePopupUrl = (url: string) => {
    if (!pendingPopupUrls.delete(url)) return;
    URL.revokeObjectURL(url);
  };

  onCleanup(() => {
    for (const url of pendingPopupUrls) URL.revokeObjectURL(url);
    pendingPopupUrls.clear();
  });

  const handleOpenInNewTab = () => {
    if (local.src !== undefined) {
      window.open(local.src, "_blank", "noreferrer");
      return;
    }

    let url: string | undefined;
    try {
      // JSON serialization avoids srcdoc attribute escaping. Escaping every
      // closing tag prevents an HTML parser from treating caller-supplied
      // `</script>` as the end of this wrapper's own script element.
      const serializedHtml = JSON.stringify(local.html ?? "").replace(
        /<\//g,
        "<\\/",
      );
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
      pendingPopupUrls.add(url);
      const revoke = () => revokePopupUrl(url!);
      // Blob URLs require an opener-related browsing context, so `noopener`
      // cannot be used here. The wrapper receives HTML only as inert JSON and
      // its child iframe has an empty sandbox; `noreferrer` still suppresses
      // referrer data.
      const popup = window.open(url, "_blank", "noreferrer");
      if (popup) popup.addEventListener("load", revoke, { once: true });
      else revoke();
    } catch (error) {
      console.error("Failed to open HTML in a new tab", error);
      if (url) revokePopupUrl(url);
    }
  };

  const handleDownload = () => {
    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;

    try {
      link = document.createElement("a");
      if (local.src !== undefined) {
        link.href = local.src;
      } else {
        url = URL.createObjectURL(
          new Blob([local.html ?? ""], { type: "text/html" }),
        );
        link.href = url;
      }
      link.download = local.filename || "download.html";
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Failed to download HTML", error);
    } finally {
      link?.remove();
      if (url) URL.revokeObjectURL(url);
    }
  };

  return (
    <figure {...rest} class={clsx(styles["elm-html-viewer"], local.class)}>
      <div class={styles.header}>
        <button
          type="button"
          class={styles["icon-button"]}
          onClick={handleDownload}
          aria-label="Download"
        >
          <ElmMdiIcon d={mdiDownload} size="1.25rem" />
        </button>

        <button
          type="button"
          class={styles["icon-button"]}
          onClick={handleOpenInNewTab}
          aria-label="Open in new tab"
        >
          <ElmMdiIcon d={mdiOpenInNew} size="1.25rem" />
        </button>
      </div>

      <hr class={styles.divider} />

      <div class={styles.content}>
        <ElmHtml
          html={local.html}
          src={local.src}
          sandbox={local.sandbox}
          autoHeight={local.autoHeight}
          allowScripts={local.allowScripts}
          height={local.height}
        />
      </div>
    </figure>
  );
};
