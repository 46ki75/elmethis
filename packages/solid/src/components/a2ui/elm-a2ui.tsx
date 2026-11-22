import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  omit,
} from "solid-js";
import type { JSX } from "@solidjs/web";
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
  const catalog = createMemo(() => props.catalog ?? notionBlockCatalog);
  const surface = createMemo(() => props.surface);
  return (
    <A2uiCatalogContext value={catalog}>
      <A2uiSurfaceContext value={surface}>
        <div class={styles.surface} data-a2ui-surface-id={props.surface.id}>
          <ComponentHost id={ROOT_COMPONENT_ID} basePath="/" />
        </div>
      </A2uiSurfaceContext>
    </A2uiCatalogContext>
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

interface ProcessorInput {
  messages: object[];
  catalogId: string | undefined;
  catalog: CatalogRenderer;
}

interface ProcessorState extends ProcessorInput {
  processor: MessageProcessor<SolidRendererEntry>;
}

const processMessages = (state: ProcessorState, messages: object[]) => {
  for (const message of messages.slice(state.messages.length)) {
    try {
      state.processor.processMessages([message] as never);
    } catch (error) {
      console.warn("[ElmA2ui] skipped invalid A2UI message:", message, error);
    }
  }
  state.messages = messages;
};

const createProcessor = ({
  messages,
  catalogId,
  catalog,
}: ProcessorInput): ProcessorState => {
  const ids = new Set([BASIC_CATALOG_ID, NOTION_BLOCK_CATALOG_ID]);
  if (catalogId) {
    ids.add(catalogId);
  }
  for (const message of messages) {
    if (
      message != null &&
      typeof message === "object" &&
      "createSurface" in message
    ) {
      const id = (message as { createSurface?: { catalogId?: string } })
        .createSurface?.catalogId;
      if (id) {
        ids.add(id);
      }
    }
  }
  const state = {
    processor: new MessageProcessor<SolidRendererEntry>(
      [...ids].map((id) => catalog.toCatalog(id)),
    ),
    messages: [],
    catalogId,
    catalog,
  };
  processMessages(state, messages);
  return state;
};

const listSurfaces = (state: ProcessorState) => [
  ...state.processor.model.surfacesMap.values(),
];

export const ElmA2ui = (props: ElmA2uiProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "url",
    "headers",
    "messages",
    "catalogId",
    "catalog",
  );
  const [streamMessages, setStreamMessages] = createSignal<object[]>([]);
  createEffect(
    () => ({
      controlled: props.messages !== undefined,
      url: props.url,
      headers: props.headers,
    }),
    ({ controlled, url, headers }) => {
      if (controlled || !url) {
        return undefined;
      }

      const controller = new AbortController();
      setStreamMessages([]);
      fetch(url, { headers, signal: controller.signal })
        .then(async (response) => {
          if (response.body == null) {
            return;
          }
          await streamJsonLines(response.body, {
            signal: controller.signal,
            onMessage: (message) => {
              if (message != null && typeof message === "object") {
                setStreamMessages((previous) => [...previous, message]);
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
      return () => controller.abort();
    },
  );

  const effective = () => props.messages ?? streamMessages();
  const allocated = new Set<ProcessorState>();
  onCleanup(() => {
    for (const state of allocated) {
      state.processor.model.dispose();
    }
    allocated.clear();
  });

  // Build a private initial model synchronously for SSR and hydration. Appending
  // to a live model notifies existing binders, so do that in the effect phase.
  const current = createMemo<ProcessorState>((previous) => {
    const messages = effective();
    const catalogId = props.catalogId;
    const catalog = props.catalog ?? notionBlockCatalog;
    if (
      previous?.catalog === catalog &&
      previous.catalogId === catalogId &&
      messages.length >= previous.messages.length &&
      previous.messages.every((message, index) => messages[index] === message)
    ) {
      return previous;
    }
    const next = createProcessor({ messages, catalogId, catalog });
    allocated.add(next);
    return next;
  });
  const [surfaces, setSurfaces] = createSignal(() => listSurfaces(current()));

  createEffect(current, (state) => {
    const sync = () => {
      setSurfaces(listSurfaces(state));
    };
    const model = state.processor.model;
    const created = model.onSurfaceCreated.subscribe(sync);
    const deleted = model.onSurfaceDeleted.subscribe(sync);
    return () => {
      created.unsubscribe();
      deleted.unsubscribe();
      if (allocated.delete(state)) {
        model.dispose();
      }
    };
  });
  createEffect(
    () => ({ state: current(), messages: effective() }),
    ({ state, messages }) => {
      processMessages(state, messages);
    },
  );

  return (
    <div
      {...rest}
      class={clsx(styles["elm-a2ui"], props.class)}
      style={props.style}
    >
      <For each={surfaces()}>
        {(surface) => (
          <A2uiSurface
            surface={surface}
            catalog={props.catalog ?? notionBlockCatalog}
          />
        )}
      </For>
    </div>
  );
};
