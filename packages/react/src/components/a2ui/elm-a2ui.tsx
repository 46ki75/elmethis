/**
 * Public A2UI v0.9 renderer (React).
 *
 * Built on the **official** `@a2ui/react` package: the recursive host
 * (`A2uiSurface` / `DeferredChild`) and the generic binder are the library's,
 * so this component only owns the convenience API around them —
 *
 *   - `messages` — render a pre-collected v0.9 message list (tests / Storybook).
 *   - `url` — fetch a JSONL stream and process each line as a v0.9 message.
 *
 * The component drives a `@a2ui/web_core` `MessageProcessor`, tracks the
 * surfaces it creates, and renders each through `A2uiSurface`. The active
 * catalog is the Elm {@link blockComponents} (official basic catalog + the
 * Elm block renderers); pass `components` to override it.
 */
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import clsx from "clsx";

import {
  A2uiSurface,
  type ReactComponentImplementation,
} from "@a2ui/react/v0_9";
import {
  Catalog,
  MessageProcessor,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

import { blockComponents, blockFunctions } from "./catalog/block-catalog";
import { streamJsonLines } from "./stream-json-lines";
import styles from "./elm-a2ui.module.css";

const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/basic_catalog.json";

const surfaceStyle = {
  "--elmethis-margin-block-start": "2rem",
} as CSSProperties;

export interface ElmA2uiProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  /** A JSONL stream URL. Mutually exclusive with `messages`. */
  url?: string;
  /** Optional headers for the stream `fetch`. */
  headers?: Record<string, string>;
  /** Pre-collected message list. Mutually exclusive with `url`. */
  messages?: object[];
  /**
   * Catalog id pre-registered alongside the ids referenced by `createSurface`
   * messages, so a stream may emit `updateComponents` before its first
   * `createSurface` arrives.
   */
  catalogId?: string;
  /**
   * Component implementations registered under every referenced catalog id.
   * Defaults to {@link blockComponents}. Pass a stable (memoized) array.
   */
  components?: ReactComponentImplementation[];
}

interface ProcessorState {
  processor: MessageProcessor<ReactComponentImplementation>;
  subs: Array<{ unsubscribe(): void }>;
  processed: number;
  messages: object[];
  catalogId: string | undefined;
}

export const ElmA2ui = ({
  className,
  style,
  url,
  headers,
  messages,
  catalogId,
  components = blockComponents,
  ...rest
}: ElmA2uiProps) => {
  // Messages produced by the URL-driven JSONL reader, kept in state so each
  // appended line re-renders and re-runs the processing effect. The
  // controlled-mode `messages` prop bypasses this.
  const [streamMessages, setStreamMessages] = useState<object[]>([]);
  // The live surfaces, in state so create/delete events drive re-renders.
  // (Data/component updates re-render through the official binder, not here.)
  const [surfaces, setSurfaces] = useState<
    SurfaceModel<ReactComponentImplementation>[]
  >([]);
  const processorRef = useRef<ProcessorState | null>(null);
  const surfaceMapRef = useRef<
    Map<string, SurfaceModel<ReactComponentImplementation>>
  >(new Map());

  // ---- JSONL streaming (only when `url` is provided) ----
  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    // Clear the previous source's buffered lines when the stream url changes —
    // synchronizing the local buffer with the external stream it mirrors.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreamMessages([]);
    fetch(url, { headers, signal: ctrl.signal })
      .then(async (res) => {
        if (!res.body) return;
        await streamJsonLines(res.body, {
          signal: ctrl.signal,
          onMessage: (m) => {
            if (m && typeof m === "object") {
              setStreamMessages((prev) => [...prev, m as object]);
            }
          },
          onError: (err, line) => {
            console.warn("[ElmA2ui] skipped invalid JSON line:", line, err);
          },
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("[ElmA2ui] stream error:", err);
        }
      });
    return () => ctrl.abort();
  }, [url, headers]);

  // ---- unified setup + sync + processing ----
  // Diffs the effective message list against the last-built state:
  //   - extension (same prefix, more items, same catalogId) → process the tail
  //   - swap (different prefix, or catalogId changed)        → rebuild
  // Surface creation/deletion is observed via subscriptions that push the live
  // surfaces into state, so asynchronously-emitted surfaces still render.
  const effective: object[] = messages ? messages : streamMessages;
  useEffect(() => {
    const syncSurfaces = () =>
      setSurfaces(Array.from(surfaceMapRef.current.values()));

    const existing = processorRef.current;
    const isExtension =
      existing !== null &&
      existing.catalogId === catalogId &&
      effective.length >= existing.messages.length &&
      existing.messages.every((m, i) => m === effective[i]);

    if (isExtension && existing) {
      const fresh = effective.slice(existing.processed);
      if (!fresh.length) return;
      for (const msg of fresh) {
        try {
          existing.processor.processMessages([msg] as never);
        } catch (err) {
          console.warn("[ElmA2ui] skipped invalid A2UI message:", msg, err);
        }
      }
      existing.processed = effective.length;
      existing.messages = effective;
      return;
    }

    // Rebuild path: stream swap or catalogId change.
    if (existing) {
      for (const s of existing.subs) s.unsubscribe();
      existing.processor.model.dispose();
    }

    const ids = new Set<string>([BASIC_CATALOG_ID]);
    if (catalogId) ids.add(catalogId);
    for (const m of effective) {
      if (m && typeof m === "object" && "createSurface" in m) {
        const id = (m as { createSurface?: { catalogId?: string } })
          .createSurface?.catalogId;
        if (typeof id === "string") ids.add(id);
      }
    }
    const catalogs = Array.from(ids).map(
      (id) => new Catalog(id, components, blockFunctions),
    );
    const processor = new MessageProcessor<ReactComponentImplementation>(
      catalogs,
    );
    const surfaceMap = surfaceMapRef.current;
    surfaceMap.clear();
    const subs: Array<{ unsubscribe(): void }> = [];
    subs.push(
      processor.model.onSurfaceCreated.subscribe((surface) => {
        surfaceMap.set(surface.id, surface);
        syncSurfaces();
      }),
    );
    subs.push(
      processor.model.onSurfaceDeleted.subscribe((id) => {
        surfaceMap.delete(id);
        syncSurfaces();
      }),
    );

    for (const msg of effective) {
      try {
        processor.processMessages([msg] as never);
      } catch (err) {
        console.warn("[ElmA2ui] skipped invalid A2UI message:", msg, err);
      }
    }

    processorRef.current = {
      processor,
      subs,
      processed: effective.length,
      messages: effective,
      catalogId,
    };
    syncSurfaces();
  }, [effective, catalogId, components]);

  // Dispose the processor graph on unmount.
  useEffect(() => {
    return () => {
      const internal = processorRef.current;
      if (!internal) return;
      for (const s of internal.subs) s.unsubscribe();
      internal.processor.model.dispose();
      processorRef.current = null;
    };
  }, []);

  return (
    <div
      className={clsx(styles["elm-a2ui"], className)}
      style={style}
      {...rest}
    >
      {surfaces.map((surface) => (
        <div key={surface.id} className={styles.surface} style={surfaceStyle}>
          <A2uiSurface surface={surface} />
        </div>
      ))}
    </div>
  );
};
