// Built-in catalog renderer map for standard A2UI component types.
// Each entry maps a component type name to a render function.
import { type CSSProperties } from "@builder.io/qwik";

import { ElmTabs } from "../containments/elm-tabs";
import styles from "./elm-a2ui.module.css";
import {
  type CatalogRendererMap,
  type RenderContext,
} from "./elm-a2ui-catalog-renderer";

// Maps A2UI `distribution` prop values to CSS `justify-content` values.
const jc: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
};

// Maps A2UI `alignment` prop values to CSS `align-items` values.
const ai: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
};

export const elmBasicCatalogRendererMap: CatalogRendererMap = {
  Text: ({ props, resolve }: RenderContext) => {
    // resolve() converts a prop to a string, handling both static strings and
    // dynamic data bindings (e.g. { path: "/user/name" } resolved at runtime).
    const text = resolve(props.text);
    const v = (props.variant as string) ?? "body";
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
      return <span class={[styles.text, styles["text-caption"]]}>{text}</span>;
    return <p class={[styles.text, styles["text-body"]]}>{text}</p>;
  },

  Row: ({ props, childRefs, renderChild }: RenderContext) => (
    <div
      class={styles.row}
      style={{
        justifyContent:
          jc[(props.distribution as string) ?? "start"] ?? "flex-start",
        alignItems: ai[(props.alignment as string) ?? "center"] ?? "center",
      }}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`} class={styles["child-wrap"]}>
          {renderChild(id, path)}
        </span>
      ))}
    </div>
  ),

  Column: ({ props, childRefs, renderChild }: RenderContext) => (
    <div
      class={styles.column}
      style={{
        justifyContent:
          jc[(props.distribution as string) ?? "start"] ?? "flex-start",
        alignItems: ai[(props.alignment as string) ?? "stretch"] ?? "stretch",
      }}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`} class={styles["child-wrap"]}>
          {renderChild(id, path)}
        </span>
      ))}
    </div>
  ),

  List: ({ props, childRefs, renderChild }: RenderContext) => (
    <div
      class={[
        styles.list,
        props.direction === "horizontal" && styles["list-horizontal"],
      ]}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <div key={`${id}:${i}`} class={styles["list-item"]}>
          {renderChild(id, path)}
        </div>
      ))}
    </div>
  ),

  Card: ({ props, renderChild }: RenderContext) => (
    <div class={styles.card}>
      {typeof props.child === "string" ? renderChild(props.child) : null}
    </div>
  ),

  Button: ({ props, componentId, renderChild }: RenderContext) => (
    <button
      class={[
        styles.button,
        props.primary === true && styles["button-primary"],
      ]}
      data-a2ui-action={props.action ? componentId : undefined}
    >
      {typeof props.child === "string" ? renderChild(props.child) : null}
    </button>
  ),

  Image: ({ props, resolve }: RenderContext) => (
    <img
      class={styles.image}
      src={resolve(props.url)}
      alt={resolve(props.alt ?? "")}
      width={props.width as number | undefined}
      height={props.height as number | undefined}
      style={{
        objectFit: (props.fit ?? "cover") as CSSProperties["objectFit"],
      }}
    />
  ),

  Icon: ({ props, resolve }: RenderContext) => (
    <span
      class={styles.icon}
      aria-label={resolve(props.name)}
      data-icon={resolve(props.name)}
    />
  ),

  Divider: ({ props }: RenderContext) => (
    <div
      class={[
        styles.divider,
        props.axis === "vertical" && styles["divider-vertical"],
      ]}
      role="separator"
    />
  ),

  TextField: ({ props, componentId, resolve }: RenderContext) => {
    const inputTypes: Record<string, string> = {
      shortText: "text",
      longText: "text",
      number: "number",
      obscured: "password",
      date: "date",
    };
    return (
      <div class={styles["text-field"]}>
        {props.label ? (
          <label class={styles.label}>{resolve(props.label)}</label>
        ) : null}
        <input
          class={styles.input}
          type={
            inputTypes[(props.textFieldType as string) ?? "shortText"] ?? "text"
          }
          value={resolve(props.text ?? "")}
          data-a2ui-input={componentId}
        />
      </div>
    );
  },

  CheckBox: ({ props, componentId, ctx, resolve }: RenderContext) => {
    const checkedVal = props.checked;
    const checked =
      typeof checkedVal === "boolean"
        ? checkedVal
        : checkedVal && typeof checkedVal === "object"
          ? Boolean(
              ctx.dataContext.resolveDynamicValue(checkedVal as never) ?? false,
            )
          : false;
    return (
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={checked}
          data-a2ui-change={`${componentId}:checked`}
        />
        {props.label ? (
          <span class={styles["checkbox-label"]}>{resolve(props.label)}</span>
        ) : null}
      </label>
    );
  },

  Slider: ({ props, componentId, ctx }: RenderContext) => {
    const valRaw = props.value;
    const sliderVal =
      typeof valRaw === "number"
        ? valRaw
        : valRaw && typeof valRaw === "object"
          ? Number(ctx.dataContext.resolveDynamicValue(valRaw as never) ?? 0)
          : 0;
    return (
      <input
        class={styles.slider}
        type="range"
        value={sliderVal}
        min={(props.minValue as number) ?? 0}
        max={(props.maxValue as number) ?? 100}
        data-a2ui-change={`${componentId}:value`}
      />
    );
  },

  Tabs: ({ props, resolve, renderChild }: RenderContext) => {
    const tabs = Array.isArray(props.tabs)
      ? (props.tabs as Array<{ title: unknown; child?: string }>)
      : [];
    return (
      <ElmTabs
        tabLabels={tabs.map((tab) => (
          <>{resolve(tab.title)}</>
        ))}
        tabContents={tabs.map((tab) =>
          tab.child ? renderChild(tab.child) : null,
        )}
      />
    );
  },

  Modal: ({ props, renderChild }: RenderContext) => (
    <div class={styles.modal}>
      {typeof props.trigger === "string" ? renderChild(props.trigger) : null}
    </div>
  ),

  Video: ({ props, resolve }: RenderContext) => (
    <video class={styles.video} controls src={resolve(props.url)} />
  ),

  AudioPlayer: ({ props, resolve }: RenderContext) => (
    <audio class={styles.audio} controls src={resolve(props.url)} />
  ),
};
