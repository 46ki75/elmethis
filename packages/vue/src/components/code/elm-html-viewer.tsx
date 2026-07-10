import { defineComponent, type HTMLAttributes, type PropType } from "vue";
import { clsx } from "clsx";
import { mdiDownload, mdiOpenInNew } from "@mdi/js";

import styles from "./elm-html-viewer.module.css";

import { ElmHtml } from "./elm-html";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmHtmlViewerProps extends HTMLAttributes {
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

  /**
   * Forwarded to the wrapped `ElmHtml`: allow the embedded content to run
   * JavaScript.
   * @default false
   */
  allowScripts?: boolean;

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

  /**
   * Forwarded to the wrapped `ElmHtml`: native iframe `height`, in pixels.
   * Sizes the inner iframe directly — the outer `<figure>`'s own
   * `style`/`class` only target the wrapper, not this. Useful when
   * `autoHeight` genuinely can't measure (e.g. `src` mode with
   * `allowScripts` — see `ElmHtml`'s `src` doc comment).
   */
  height?: number | `${number}`;
}

export const ElmHtmlViewer = defineComponent({
  name: "ElmHtmlViewer",
  props: {
    html: { type: String, default: undefined },
    src: { type: String, default: undefined },
    filename: { type: String, default: undefined },
    sandbox: { type: String, default: undefined },
    autoHeight: { type: Boolean, default: undefined },
    allowScripts: { type: Boolean, default: undefined },
    height: {
      type: [Number, String] as PropType<number | `${number}`>,
      default: undefined,
    },
  },
  setup(props) {
    const usingSrc = () => props.src !== undefined;

    const handleOpenInNewTab = () => {
      if (usingSrc()) {
        window.open(props.src, "_blank", "noreferrer");
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
        const serializedHtml = JSON.stringify(props.html ?? "").replace(
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
        link = document.createElement("a");
        if (usingSrc()) {
          link.href = props.src!;
        } else {
          url = URL.createObjectURL(
            new Blob([props.html ?? ""], { type: "text/html" }),
          );
          link.href = url;
        }
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
            src={props.src}
            sandbox={props.sandbox}
            autoHeight={props.autoHeight}
            allowScripts={props.allowScripts}
            height={props.height}
          />
        </div>
      </figure>
    );
  },
});
