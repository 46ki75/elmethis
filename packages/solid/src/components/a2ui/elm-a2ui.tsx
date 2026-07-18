import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";

import { MessageProcessor, type SurfaceModel } from "@a2ui/web_core/v0_9";
import { NOTION_BLOCK_CATALOG_ID } from "@elmethis/core";

import { notionBlockCatalog } from "./catalog/notion-block-catalog";
import {
  type CatalogRenderer,
  type SolidRendererEntry,
} from "./catalog/catalog";
import {
  A2uiCatalogContext,
  A2uiSurfaceContext,
  ComponentHost,
  ROOT_COMPONENT_ID,
} from "./component-host";
import { streamJsonLines } from "./stream-json-lines";
import styles from "./elm-a2ui.module.css";

export const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/basic_catalog.json";

export interface A2uiSurfaceProps {
  surface: SurfaceModel<SolidRendererEntry>;
  catalog?: CatalogRenderer;
}

/** Renders an existing v0.9 surface with the Solid-native recursive host. */
export const A2uiSurface = (props: A2uiSurfaceProps) => {
  const [local] = splitProps(props, ["catalog", "surface"]);
  const catalog = createMemo(() => local.catalog ?? notionBlockCatalog);
  const surface = createMemo(() => local.surface);
  return (
    <A2uiCatalogContext.Provider value={catalog}>
      <A2uiSurfaceContext.Provider value={surface}>
        <div class={styles.surface} data-a2ui-surface-id={local.surface.id}>
          <ComponentHost id={ROOT_COMPONENT_ID} basePath="/" />
        </div>
      </A2uiSurfaceContext.Provider>
    </A2uiCatalogContext.Provider>
  );
};

export interface ElmA2uiProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** A JSONL stream URL. `messages` takes precedence when both are supplied. */
  url?: string;
  /** Optional headers for the stream request. A new object restarts the request. */
  headers?: Record<string, string>;
  /** Pre-collected v0.9 messages. Takes precedence over `url`. */
  messages?: object[];
  /** An additional catalog id to pre-register. */
  catalogId?: string;
  /**
   * Solid uses a paired {@link CatalogRenderer}, not React's `components`
   * array. Extend `notionBlockCatalog` or `basicCatalog` with
   * `defineRenderer()` so the processor and renderer receive identical APIs.
   */
  catalog?: CatalogRenderer;
}

interface ProcessorState {
  processor: MessageProcessor<SolidRendererEntry>;
  subscriptions: Array<{ unsubscribe(): void }>;
  processed: number;
  messages: object[];
  catalogId: string | undefined;
  catalog: CatalogRenderer;
}

export const ElmA2ui = (props: ElmA2uiProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "url",
    "headers",
    "messages",
    "catalogId",
    "catalog",
  ]);
  const [streamMessages, setStreamMessages] = createSignal<object[]>([]);
  const [surfaces, setSurfaces] = createSignal<
    SurfaceModel<SolidRendererEntry>[]
  >([]);
  let current: ProcessorState | undefined;

  const disposeCurrent = () => {
    if (current == null) return;
    for (const subscription of current.subscriptions) {
      subscription.unsubscribe();
    }
    current.processor.model.dispose();
    current = undefined;
  };
  onCleanup(disposeCurrent);

  createEffect(() => {
    const controlledMessages = local.messages;
    const url = local.url;
    const headers = local.headers;
    if (controlledMessages !== undefined || !url) return;

    const controller = new AbortController();
    setStreamMessages([]);
    fetch(url, { headers, signal: controller.signal })
      .then(async (response) => {
        if (response.body == null) return;
        await streamJsonLines(response.body, {
          signal: controller.signal,
          onMessage: (message) => {
            if (message != null && typeof message === "object") {
              setStreamMessages((previous) => [...previous, message as object]);
            }
          },
          onError: (error, line) => {
            console.warn("[ElmA2ui] skipped invalid JSON line:", line, error);
          },
        });
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error) || error.name !== "AbortError") {
          console.error("[ElmA2ui] stream error:", error);
        }
      });
    onCleanup(() => controller.abort());
  });

  createEffect(() => {
    const effective = local.messages ?? streamMessages();
    const catalogId = local.catalogId;
    const catalog = local.catalog ?? notionBlockCatalog;
    const isExtension =
      current != null &&
      current.catalog === catalog &&
      current.catalogId === catalogId &&
      effective.length >= current.messages.length &&
      current.messages.every((message, index) => message === effective[index]);

    if (isExtension && current != null) {
      for (const message of effective.slice(current.processed)) {
        try {
          current.processor.processMessages([message] as never);
        } catch (error) {
          console.warn(
            "[ElmA2ui] skipped invalid A2UI message:",
            message,
            error,
          );
        }
      }
      current.processed = effective.length;
      current.messages = effective;
      return;
    }

    disposeCurrent();
    const ids = new Set([BASIC_CATALOG_ID, NOTION_BLOCK_CATALOG_ID]);
    if (catalogId) ids.add(catalogId);
    for (const message of effective) {
      if (
        message != null &&
        typeof message === "object" &&
        "createSurface" in message
      ) {
        const id = (message as { createSurface?: { catalogId?: string } })
          .createSurface?.catalogId;
        if (id) ids.add(id);
      }
    }

    const processor = new MessageProcessor<SolidRendererEntry>(
      [...ids].map((id) => catalog.toCatalog(id)),
    );
    const surfaceMap = new Map<string, SurfaceModel<SolidRendererEntry>>();
    const syncSurfaces = () => setSurfaces([...surfaceMap.values()]);
    const subscriptions = [
      processor.model.onSurfaceCreated.subscribe(
        (surface: SurfaceModel<SolidRendererEntry>) => {
          surfaceMap.set(surface.id, surface);
          syncSurfaces();
        },
      ),
      processor.model.onSurfaceDeleted.subscribe((id: string) => {
        surfaceMap.delete(id);
        syncSurfaces();
      }),
    ];

    current = {
      processor,
      subscriptions,
      processed: 0,
      messages: effective,
      catalogId,
      catalog,
    };

    for (const message of effective) {
      try {
        processor.processMessages([message] as never);
      } catch (error) {
        console.warn("[ElmA2ui] skipped invalid A2UI message:", message, error);
      }
    }
    current.processed = effective.length;
    syncSurfaces();
  });

  return (
    <div
      {...rest}
      class={clsx(styles["elm-a2ui"], local.class)}
      style={local.style}
    >
      <For each={surfaces()}>
        {(surface) => (
          <A2uiSurface
            surface={surface}
            catalog={local.catalog ?? notionBlockCatalog}
          />
        )}
      </For>
    </div>
  );
};
