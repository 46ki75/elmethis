import {
  component$,
  noSerialize,
  type NoSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type CSSProperties,
  type JSX,
} from "@builder.io/qwik";

import {
  ComponentContext,
  MessageProcessor,
  Catalog,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  BASIC_COMPONENTS,
  BASIC_FUNCTIONS,
} from "@a2ui/web_core/v0_9/basic_catalog";

import styles from "./elm-a2ui.module.css";

export interface ElmA2uiRendererProps {
  class?: string;
  style?: CSSProperties;
  /** A2UI v0.9 protocol messages to render. */
  messages: unknown[];
  /**
   * Catalog ID to pre-register before messages arrive — useful for streaming
   * where the catalogId is known upfront but createSurface hasn't arrived yet.
   * If omitted, catalog IDs are extracted from the messages array.
   */
  catalogId?: string;
}

/** Renders A2UI v0.9 messages. Manages MessageProcessor internally. */
export const ElmA2uiRenderer = component$<ElmA2uiRendererProps>(
  ({ class: className, style, messages, catalogId }) => {
    const containerRef = useSignal<HTMLDivElement | undefined>(undefined);
    const surfaceMapSig = useSignal<
      NoSerialize<Map<string, SurfaceModel<ComponentApi>>> | undefined
    >();
    const tick = useStore<{ v: number }>({ v: 0 });
    const internalRef = useSignal<
      | NoSerialize<{
          processor: MessageProcessor<ComponentApi>;
          processed: number;
        }>
      | undefined
    >();

    // ---- setup (runs once on mount) ----

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      const container = containerRef.value!;

      // Collect all catalog IDs from the prop and from any createSurface messages
      const catalogIdSet = new Set<string>();
      if (catalogId) catalogIdSet.add(catalogId);
      for (const m of messages) {
        if (m && typeof m === "object" && "createSurface" in m) {
          const id = (m as { createSurface?: { catalogId?: string } })
            .createSurface?.catalogId;
          if (typeof id === "string") catalogIdSet.add(id);
        }
      }
      // Always register the standard catalog as a fallback
      catalogIdSet.add(
        "https://a2ui.org/specification/v0_9/basic_catalog.json",
      );

      const catalogs = Array.from(catalogIdSet).map(
        (id) =>
          new Catalog(id, BASIC_COMPONENTS as ComponentApi[], BASIC_FUNCTIONS),
      );
      const processor = new MessageProcessor<ComponentApi>(catalogs);
      const surfaceMap = new Map<string, SurfaceModel<ComponentApi>>();
      surfaceMapSig.value = noSerialize(surfaceMap);

      const subCreated = processor.model.onSurfaceCreated.subscribe(
        (surface) => {
          surfaceMap.set(surface.id, surface);
          surface.componentsModel.onCreated.subscribe(() => {
            tick.v++;
          });
          surface.componentsModel.onDeleted.subscribe(() => {
            tick.v++;
          });
          tick.v++;
        },
      );
      const subDeleted = processor.model.onSurfaceDeleted.subscribe((id) => {
        surfaceMap.delete(id);
        tick.v++;
      });

      internalRef.value = noSerialize({ processor, processed: 0 });

      const handleClick = (e: MouseEvent) => {
        const map = surfaceMapSig.value;
        if (!map) return;
        const el = (e.target as HTMLElement).closest(
          "[data-a2ui-action]",
        ) as HTMLElement | null;
        if (!el) return;
        const [sid, cid] = (el.dataset.a2uiAction ?? "").split(":");
        const surface = map.get(sid);
        const model = surface?.componentsModel.get(cid);
        if (!surface || !model?.properties.action) return;
        const ctx = new ComponentContext(surface, cid);
        surface
          .dispatchAction(
            ctx.dataContext.resolveAction(model.properties.action),
            cid,
          )
          .catch(console.error);
      };

      const handleInput = (e: Event) => {
        const map = surfaceMapSig.value;
        if (!map) return;
        const el = e.target as HTMLInputElement;
        const [sid, cid] = (el.dataset.a2uiInput ?? "").split(":");
        const surface = map.get(sid);
        const model = surface?.componentsModel.get(cid);
        if (!surface || !model) return;
        const bound = model.properties.text;
        if (bound && typeof bound === "object" && "path" in bound) {
          new ComponentContext(surface, cid).dataContext.set(
            bound.path as string,
            el.value,
          );
        }
      };

      const handleChange = (e: Event) => {
        const map = surfaceMapSig.value;
        if (!map) return;
        const el = e.target as HTMLInputElement;
        const parts = (el.dataset.a2uiChange ?? "").split(":");
        if (parts.length < 3) return;
        const [sid, cid, prop] = parts;
        const surface = map.get(sid);
        const model = surface?.componentsModel.get(cid);
        if (!surface || !model) return;
        const bound = model.properties[prop];
        if (bound && typeof bound === "object" && "path" in bound) {
          const value = el.type === "checkbox" ? el.checked : Number(el.value);
          new ComponentContext(surface, cid).dataContext.set(
            bound.path as string,
            value,
          );
        }
        const action =
          model.properties.onChange ?? model.properties.onChangeEnd;
        if (action) {
          const ctx = new ComponentContext(surface, cid);
          surface
            .dispatchAction(ctx.dataContext.resolveAction(action), cid)
            .catch(console.error);
        }
      };

      container.addEventListener("click", handleClick);
      container.addEventListener("input", handleInput);
      container.addEventListener("change", handleChange);

      cleanup(() => {
        subCreated.unsubscribe();
        subDeleted.unsubscribe();
        container.removeEventListener("click", handleClick);
        container.removeEventListener("input", handleInput);
        container.removeEventListener("change", handleChange);
      });
    });

    // ---- incremental processing (initial batch + streaming updates) ----

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => messages.length);
      const internal = internalRef.value;
      if (!internal) return;
      const newMsgs = messages.slice(internal.processed);
      if (!newMsgs.length) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internal.processor.processMessages(newMsgs as any[]);
      internal.processed = messages.length;
      tick.v++;
    });

    // ---- rendering ----

    const findRootId = (surface: SurfaceModel<ComponentApi>): string | null => {
      const all = new Set<string>();
      const referenced = new Set<string>();
      for (const [id, model] of surface.componentsModel.entries) {
        all.add(id);
        const p = model.properties;
        if (typeof p.child === "string") referenced.add(p.child);
        if (typeof p.trigger === "string") referenced.add(p.trigger);
        if (Array.isArray(p.children))
          for (const c of p.children)
            if (typeof c === "string") referenced.add(c);
        if (Array.isArray(p.tabs))
          for (const tab of p.tabs as Array<{ child?: string }>)
            if (typeof tab.child === "string") referenced.add(tab.child);
      }
      for (const id of all) if (!referenced.has(id)) return id;
      return null;
    };

    const renderTree = (
      componentId: string,
      surface: SurfaceModel<ComponentApi>,
      basePath = "/",
      depth = 0,
    ): JSX.Element | null => {
      if (depth > 50) return null;
      const model = surface.componentsModel.get(componentId);
      if (!model) return null;

      const ctx = new ComponentContext(surface, componentId, basePath);
      const p = model.properties;
      const sid = surface.id;
      const cid = componentId;

      const resolve = (v: unknown): string => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object")
          return String(ctx.dataContext.resolveDynamicValue(v as never) ?? "");
        return String(v ?? "");
      };

      const childRefs = (children: unknown): { id: string; path: string }[] => {
        if (Array.isArray(children))
          return children
            .filter((id): id is string => typeof id === "string")
            .map((id) => ({ id, path: basePath }));
        if (
          children &&
          typeof children === "object" &&
          "componentId" in children
        ) {
          const tmpl = children as { componentId: string; path: string };
          const items = surface.dataModel.get(tmpl.path);
          if (!Array.isArray(items)) return [];
          return items.map((_, i) => ({
            id: tmpl.componentId,
            path: `${tmpl.path}/${i}`,
          }));
        }
        return [];
      };

      const jc: Record<string, string> = {
        start: "flex-start",
        end: "flex-end",
        center: "center",
        spaceBetween: "space-between",
        spaceAround: "space-around",
        spaceEvenly: "space-evenly",
      };
      const ai: Record<string, string> = {
        start: "flex-start",
        end: "flex-end",
        center: "center",
        stretch: "stretch",
      };

      switch (model.type) {
        case "Text": {
          const text = resolve(p.text);
          const v = (p.variant as string) ?? "body";
          if (v === "h1")
            return <h1 class={[styles.text, styles["text-h1"]]}>{text}</h1>;
          if (v === "h2")
            return <h2 class={[styles.text, styles["text-h2"]]}>{text}</h2>;
          if (v === "h3")
            return <h3 class={[styles.text, styles["text-h3"]]}>{text}</h3>;
          if (v === "h4")
            return <h4 class={[styles.text, styles["text-h4"]]}>{text}</h4>;
          if (v === "h5")
            return <h5 class={[styles.text, styles["text-h5"]]}>{text}</h5>;
          if (v === "caption")
            return (
              <span class={[styles.text, styles["text-caption"]]}>{text}</span>
            );
          return <p class={[styles.text, styles["text-body"]]}>{text}</p>;
        }

        case "Row":
          return (
            <div
              class={styles.row}
              style={{
                justifyContent:
                  jc[(p.distribution as string) ?? "start"] ?? "flex-start",
                alignItems: ai[(p.alignment as string) ?? "center"] ?? "center",
              }}
            >
              {childRefs(p.children).map(({ id, path }, i) => (
                <span key={`${id}:${i}`} class={styles["child-wrap"]}>
                  {renderTree(id, surface, path, depth + 1)}
                </span>
              ))}
            </div>
          );

        case "Column":
          return (
            <div
              class={styles.column}
              style={{
                justifyContent:
                  jc[(p.distribution as string) ?? "start"] ?? "flex-start",
                alignItems:
                  ai[(p.alignment as string) ?? "stretch"] ?? "stretch",
              }}
            >
              {childRefs(p.children).map(({ id, path }, i) => (
                <span key={`${id}:${i}`} class={styles["child-wrap"]}>
                  {renderTree(id, surface, path, depth + 1)}
                </span>
              ))}
            </div>
          );

        case "List":
          return (
            <div
              class={[
                styles.list,
                p.direction === "horizontal" && styles["list-horizontal"],
              ]}
            >
              {childRefs(p.children).map(({ id, path }, i) => (
                <div key={`${id}:${i}`} class={styles["list-item"]}>
                  {renderTree(id, surface, path, depth + 1)}
                </div>
              ))}
            </div>
          );

        case "Card":
          return (
            <div class={styles.card}>
              {typeof p.child === "string"
                ? renderTree(p.child, surface, basePath, depth + 1)
                : null}
            </div>
          );

        case "Button":
          return (
            <button
              class={[
                styles.button,
                p.primary === true && styles["button-primary"],
              ]}
              data-a2ui-action={p.action ? `${sid}:${cid}` : undefined}
            >
              {typeof p.child === "string"
                ? renderTree(p.child, surface, basePath, depth + 1)
                : null}
            </button>
          );

        case "Image":
          return (
            <img
              class={styles.image}
              src={resolve(p.url)}
              alt={resolve(p.alt ?? "")}
              width={p.width as number | undefined}
              height={p.height as number | undefined}
              style={{
                objectFit: (p.fit ?? "cover") as CSSProperties["objectFit"],
              }}
            />
          );

        case "Icon":
          return (
            <span
              class={styles.icon}
              aria-label={resolve(p.name)}
              data-icon={resolve(p.name)}
            />
          );

        case "Divider":
          return (
            <div
              class={[
                styles.divider,
                p.axis === "vertical" && styles["divider-vertical"],
              ]}
              role="separator"
            />
          );

        case "TextField": {
          const inputTypes: Record<string, string> = {
            shortText: "text",
            longText: "text",
            number: "number",
            obscured: "password",
            date: "date",
          };
          return (
            <div class={styles["text-field"]}>
              {p.label ? (
                <label class={styles.label}>{resolve(p.label)}</label>
              ) : null}
              <input
                class={styles.input}
                type={
                  inputTypes[(p.textFieldType as string) ?? "shortText"] ??
                  "text"
                }
                value={resolve(p.text ?? "")}
                data-a2ui-input={`${sid}:${cid}`}
              />
            </div>
          );
        }

        case "CheckBox": {
          const checkedVal = p.checked;
          const checked =
            typeof checkedVal === "boolean"
              ? checkedVal
              : checkedVal && typeof checkedVal === "object"
                ? Boolean(
                    ctx.dataContext.resolveDynamicValue(checkedVal as never) ??
                    false,
                  )
                : false;
          return (
            <label class={styles.checkbox}>
              <input
                type="checkbox"
                checked={checked}
                data-a2ui-change={`${sid}:${cid}:checked`}
              />
              {p.label ? (
                <span class={styles["checkbox-label"]}>{resolve(p.label)}</span>
              ) : null}
            </label>
          );
        }

        case "Slider": {
          const valRaw = p.value;
          const sliderVal =
            typeof valRaw === "number"
              ? valRaw
              : valRaw && typeof valRaw === "object"
                ? Number(
                    ctx.dataContext.resolveDynamicValue(valRaw as never) ?? 0,
                  )
                : 0;
          return (
            <input
              class={styles.slider}
              type="range"
              value={sliderVal}
              min={(p.minValue as number) ?? 0}
              max={(p.maxValue as number) ?? 100}
              data-a2ui-change={`${sid}:${cid}:value`}
            />
          );
        }

        case "Tabs": {
          const tabs = Array.isArray(p.tabs)
            ? (p.tabs as Array<{ title: unknown; child?: string }>)
            : [];
          return (
            <div class={styles.tabs}>
              <div class={styles["tabs-bar"]} role="tablist">
                {tabs.map((tab, i) => (
                  <button key={i} class={styles["tab-button"]} role="tab">
                    {resolve(tab.title)}
                  </button>
                ))}
              </div>
              <div class={styles["tab-content"]} role="tabpanel">
                {tabs[0]?.child
                  ? renderTree(tabs[0].child, surface, basePath, depth + 1)
                  : null}
              </div>
            </div>
          );
        }

        case "Modal":
          return (
            <div class={styles.modal}>
              {typeof p.trigger === "string"
                ? renderTree(p.trigger, surface, basePath, depth + 1)
                : null}
            </div>
          );

        case "Video":
          return <video class={styles.video} controls src={resolve(p.url)} />;

        case "AudioPlayer":
          return <audio class={styles.audio} controls src={resolve(p.url)} />;

        default:
          return null;
      }
    };

    return (
      <div
        class={[styles["elm-a2ui"], className]}
        style={style}
        ref={containerRef}
      >
        {tick.v >= 0 &&
          Array.from(surfaceMapSig.value?.values() ?? []).map((surface) => {
            const rootId = findRootId(surface);
            if (!rootId) return null;
            return (
              <div key={surface.id} class={styles.surface}>
                {renderTree(rootId, surface)}
              </div>
            );
          })}
      </div>
    );
  },
);
