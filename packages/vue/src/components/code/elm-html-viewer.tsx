import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";
import { mdiDownload, mdiOpenInNew } from "@mdi/js";

import styles from "./elm-html-viewer.module.css";

import { ElmHtml } from "./elm-html";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmHtmlViewerProps extends HTMLAttributes {
  /** Raw HTML markup to render, and to open in a new tab or download. */
  html: string;

  /**
   * Filename used when downloading the HTML via the header's download button.
   * @default "download.html"
   */
  filename?: string;

  /**
   * Sandbox flags forwarded to the wrapped `ElmHtml`'s iframe (space-separated,
   * same syntax as the native `sandbox` attribute).
   */
  sandbox?: string;

  /**
   * Forwarded to the wrapped `ElmHtml`: stretch its iframe to fit its content
   * height.
   * @default true
   */
  autoHeight?: boolean;
}

export const ElmHtmlViewer = defineComponent({
  name: "ElmHtmlViewer",
  props: {
    html: { type: String, required: true },
    filename: { type: String, default: undefined },
    sandbox: { type: String, default: undefined },
    autoHeight: { type: Boolean, default: undefined },
  },
  setup(props) {
    const handleOpenInNewTab = () => {
      let url: string | undefined;
      try {
        // The new tab must stay exactly as sandboxed as the inline preview:
        // wrap `html` in a script-sandboxed iframe instead of navigating the
        // tab to it directly, so an embedded <script> still can't execute.
        // `html` is injected via JSON.stringify rather than the `srcdoc`
        // attribute to avoid manual attribute-escaping bugs; "</script" is
        // escaped separately because the HTML parser looks for that literal
        // byte sequence before the wrapper's own script is parsed as JS.
        const serializedHtml = JSON.stringify(props.html).replace(
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
    };

    const handleDownload = () => {
      let url: string | undefined;
      let link: HTMLAnchorElement | undefined;
      try {
        url = URL.createObjectURL(
          new Blob([props.html], { type: "text/html" }),
        );
        link = document.createElement("a");
        link.href = url;
        link.download = props.filename || "download.html";
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error("Failed to download HTML", error);
      } finally {
        link?.remove();
        if (url) URL.revokeObjectURL(url);
      }
    };

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <figure class={clsx(styles["elm-html-viewer"])}>
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
            html={props.html}
            sandbox={props.sandbox}
            autoHeight={props.autoHeight}
          />
        </div>
      </figure>
    );
  },
});
