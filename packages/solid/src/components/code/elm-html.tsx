import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, omit, Show } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-html.module.css";

export interface ElmHtmlProps extends Omit<
  JSX.IframeHTMLAttributes<HTMLIFrameElement>,
  "src" | "srcdoc" | "referrerPolicy" | "referrerpolicy"
> {
  /**
   * Raw HTML markup to render. Mutually exclusive with `src`; `src` takes
   * precedence if both are supplied.
   */
  html?: string;

  /**
   * URL of a remote document to render. Remote documents always use
   * `referrerPolicy="no-referrer"`. Same-origin sources can be measured, but
   * genuinely cross-origin sources need an explicit `height` or CSS height.
   */
  src?: string;

  /** Stretch the iframe to its content height. @default true */
  autoHeight?: boolean;

  /**
   * Add `allow-scripts` to the sandbox. `allow-same-origin` is never retained
   * with it because that combination lets embedded content escape the sandbox.
   * @default false
   */
  allowScripts?: boolean;
}

const AUTO_HEIGHT_MESSAGE_KIND = "elmethis:elm-html:auto-height";
const PROTECTED_ATTRIBUTES = new Set([
  "referrerpolicy",
  "sandbox",
  "src",
  "srcdoc",
]);

function sandboxHasAllowScripts(
  sandbox: string | undefined,
  allowScripts: boolean,
): boolean {
  if (allowScripts) {
    return true;
  }
  return (sandbox?.split(/\s+/).filter(Boolean) ?? []).some(
    (token) => token.toLowerCase() === "allow-scripts",
  );
}

function normalizeSandbox(
  sandbox: string | undefined,
  autoHeight: boolean,
  allowScripts: boolean,
): string {
  const tokens =
    sandbox
      ?.split(/\s+/)
      .filter(Boolean)
      .map((token) => token.toLowerCase()) ?? [];
  const hasToken = (name: string) =>
    tokens.some((token) => token.toLowerCase() === name);

  if (allowScripts && !hasToken("allow-scripts")) {
    tokens.push("allow-scripts");
  }

  if (sandboxHasAllowScripts(sandbox, allowScripts)) {
    return tokens
      .filter((token) => token.toLowerCase() !== "allow-same-origin")
      .join(" ");
  }

  if (autoHeight && !hasToken("allow-same-origin")) {
    tokens.push("allow-same-origin");
  }

  return tokens.join(" ");
}

// The reporter runs inside an opaque, script-enabled sandbox. Its namespaced
// message is accepted only when the browser-authenticated event.source is the
// iframe's own WindowProxy.
function withAutoHeightReporter(html: string): string {
  return `${html}
<script>(function () {
  var send = function () {
    try {
      parent.postMessage(
        { kind: ${JSON.stringify(AUTO_HEIGHT_MESSAGE_KIND)}, height: document.documentElement.scrollHeight },
        "*"
      );
    } catch (e) {}
  };
  new ResizeObserver(send).observe(document.documentElement);
  send();
})();</script>`;
}

type IframeAttributes = JSX.IframeHTMLAttributes<HTMLIFrameElement>;

function mergeMeasuredHeight(
  style: IframeAttributes["style"],
  height: number | undefined,
): IframeAttributes["style"] {
  if (height === undefined) {
    return style;
  }
  if (typeof style === "string") {
    return [style.trim().replace(/;$/, ""), `height:${height}px`]
      .filter(Boolean)
      .join(";");
  }
  return { ...(style || {}), height: `${height}px` };
}

interface ElmHtmlFrameProps {
  html?: string;
  src?: string;
  autoHeight: boolean;
  allowScripts: boolean;
  sandbox?: IframeAttributes["sandbox"];
  title?: IframeAttributes["title"];
  class?: IframeAttributes["class"];
  style?: IframeAttributes["style"];
  height?: IframeAttributes["height"];
  forwardedRef?: IframeAttributes["ref"];
  nativeProps: IframeAttributes;
}

const ElmHtmlFrame = (props: ElmHtmlFrameProps) => {
  let iframe: HTMLIFrameElement | undefined;
  const [contentHeight, setContentHeight] = createSignal<number>();
  const hasAllowScripts = createMemo(() =>
    sandboxHasAllowScripts(props.sandbox || undefined, props.allowScripts),
  );
  const effectiveSandbox = createMemo(() =>
    normalizeSandbox(
      props.sandbox || undefined,
      props.autoHeight,
      props.allowScripts,
    ),
  );

  createEffect(
    () =>
      [
        props.html,
        props.src,
        props.autoHeight,
        hasAllowScripts(),
        effectiveSandbox(),
      ] as const,
    ([, src, autoHeight, scriptsAllowed]) => {
      setContentHeight(undefined);
      const element = iframe;
      if (!autoHeight || !element || (src !== undefined && scriptsAllowed)) {
        return undefined;
      }

      if (scriptsAllowed) {
        const onMessage = (event: MessageEvent) => {
          if (event.source !== element.contentWindow) {
            return;
          }
          const data = event.data as
            | { kind?: unknown; height?: unknown }
            | null
            | undefined;
          if (
            !data ||
            data.kind !== AUTO_HEIGHT_MESSAGE_KIND ||
            typeof data.height !== "number"
          ) {
            return;
          }
          setContentHeight(data.height);
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
      }

      let observer: ResizeObserver | undefined;
      const contentRoot = () => {
        try {
          return element.contentDocument?.documentElement;
        } catch {
          return undefined;
        }
      };
      const measure = () => {
        const root = contentRoot();
        if (root) {
          setContentHeight(root.scrollHeight);
        }
      };
      const attachObserver = () => {
        const root = contentRoot();
        if (!root) {
          return;
        }
        observer?.disconnect();
        observer = new ResizeObserver(measure);
        observer.observe(root);
      };
      const onLoad = () => {
        measure();
        attachObserver();
      };

      element.addEventListener("load", onLoad);
      return () => {
        element.removeEventListener("load", onLoad);
        observer?.disconnect();
      };
    },
  );

  const usingSrc = () => props.src !== undefined;
  const callerHasObjectHeight = () => {
    const style = props.style;
    return typeof style === "object" && style?.height !== undefined;
  };

  return (
    <iframe
      {...props.nativeProps}
      ref={[
        (element) => {
          iframe = element;
        },
        props.forwardedRef,
      ]}
      title={props.title ?? "Embedded HTML content"}
      class={clsx(styles["elm-html"], props.class)}
      style={
        props.autoHeight
          ? mergeMeasuredHeight(props.style, contentHeight())
          : props.style
      }
      height={
        props.autoHeight
          ? contentHeight() === undefined && !callerHasObjectHeight()
            ? props.height
            : undefined
          : props.height
      }
      src={usingSrc() ? props.src : undefined}
      srcdoc={
        usingSrc()
          ? undefined
          : props.autoHeight && hasAllowScripts()
            ? withAutoHeightReporter(props.html ?? "")
            : (props.html ?? "")
      }
      sandbox={effectiveSandbox()}
      referrerpolicy={usingSrc() ? "no-referrer" : undefined}
    />
  );
};

export const ElmHtml = (props: ElmHtmlProps) => {
  const rest = omit(
    props,
    "allowScripts",
    "autoHeight",
    "class",
    "children",
    "height",
    "html",
    "ref",
    "sandbox",
    "src",
    "style",
    "title",
  );
  const nativeProps = omit(
    rest,
    (name) =>
      typeof name === "string" && PROTECTED_ATTRIBUTES.has(name.toLowerCase()),
  );

  const frame = (autoHeight: boolean) => (
    <ElmHtmlFrame
      html={props.html}
      src={props.src}
      autoHeight={autoHeight}
      allowScripts={props.allowScripts ?? false}
      sandbox={props.sandbox}
      title={props.title}
      class={props.class}
      style={props.style}
      height={props.height}
      forwardedRef={props.ref}
      nativeProps={nativeProps}
    />
  );

  // A JSX `key` is not a remount instruction in Solid. These mutually
  // exclusive owned branches dispose and recreate the iframe browsing context
  // whenever autoHeight changes, so sandbox flags apply to a fresh navigation.
  return (
    <Show when={props.autoHeight ?? true} keyed fallback={frame(false)}>
      {frame(true)}
    </Show>
  );
};
