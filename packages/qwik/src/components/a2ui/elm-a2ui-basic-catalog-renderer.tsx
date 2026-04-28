// Built-in catalog renderer map for standard A2UI component types.
// Each entry maps a component type name to a render function.
import { type CSSProperties } from "@builder.io/qwik";
import { z } from "zod";
import {
  AudioPlayerApi,
  ButtonApi,
  CardApi,
  CheckBoxApi,
  ChoicePickerApi,
  ColumnApi,
  DateTimeInputApi,
  DividerApi,
  IconApi,
  ImageApi,
  ListApi,
  ModalApi,
  RowApi,
  SliderApi,
  TabsApi,
  TextApi,
  TextFieldApi,
  VideoApi,
} from "@a2ui/web_core/v0_9/basic_catalog";

import { ElmTabs } from "../containments/elm-tabs";
import styles from "./elm-a2ui.module.css";
import {
  type CatalogRendererMap,
  type RenderContext,
} from "./elm-a2ui-catalog-renderer";
import { ElmHeading, ElmInlineText, ElmParagraph } from "../..";

type Props<T extends { schema: z.ZodTypeAny }> = z.infer<T["schema"]>;
type Ctx<T extends { schema: z.ZodTypeAny }> = RenderContext<Props<T>>;

// Maps A2UI `justify` prop values to CSS `justify-content` values.
const jc: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
  stretch: "stretch",
};

// Maps A2UI `align` prop values to CSS `align-items` values.
const ai: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
};

// Maps A2UI `fit` prop values to CSS `object-fit` values.
const fitMap: Record<string, CSSProperties["objectFit"]> = {
  contain: "contain",
  cover: "cover",
  fill: "fill",
  none: "none",
  scaleDown: "scale-down",
};

export const elmBasicCatalogRendererMap: CatalogRendererMap<
  | "Text"
  | "Row"
  | "Column"
  | "List"
  | "Card"
  | "Button"
  | "Image"
  | "Icon"
  | "Divider"
  | "TextField"
  | "CheckBox"
  | "Slider"
  | "Tabs"
  | "Modal"
  | "Video"
  | "AudioPlayer"
  | "ChoicePicker"
  | "DateTimeInput"
> = {
  Text: ({ props, resolve }: Ctx<typeof TextApi>) => {
    const text = resolve(props.text);
    const v = props.variant ?? "body";
    if (v === "caption") return <ElmInlineText>{text}</ElmInlineText>;
    if (v === "body") return <ElmParagraph>{text}</ElmParagraph>;

    const level = () => {
      switch (v) {
        case "h1":
          return 1;
        case "h2":
          return 2;
        case "h3":
          return 3;
        case "h4":
          return 4;
        case "h5":
          return 5;
        default:
          return 1;
      }
    };
    return <ElmHeading level={level()}>{text}</ElmHeading>;
  },

  Row: ({ props, childRefs, renderChild }: Ctx<typeof RowApi>) => (
    <div
      class={styles.row}
      style={{
        justifyContent: jc[props.justify ?? "start"] ?? "flex-start",
        alignItems: ai[props.align ?? "center"] ?? "center",
      }}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`} class={styles["child-wrap"]}>
          {renderChild(id, path, i)}
        </span>
      ))}
    </div>
  ),

  Column: ({ props, childRefs, renderChild }: Ctx<typeof ColumnApi>) => (
    <div class={styles.column} style={{ "--margin-block": "2rem" }}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`} class={styles["child-wrap"]}>
          {renderChild(id, path, i)}
        </span>
      ))}
    </div>
  ),

  List: ({ props, childRefs, renderChild }: Ctx<typeof ListApi>) => (
    <div
      class={[
        styles.list,
        props.direction === "horizontal" && styles["list-horizontal"],
      ]}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <div key={`${id}:${i}`} class={styles["list-item"]}>
          {renderChild(id, path, i)}
        </div>
      ))}
    </div>
  ),

  Card: ({ props, renderChild }: Ctx<typeof CardApi>) => (
    <div class={styles.card}>{renderChild(props.child)}</div>
  ),

  Button: ({ props, componentId, renderChild }: Ctx<typeof ButtonApi>) => (
    <button
      class={[
        styles.button,
        props.variant === "primary" && styles["button-primary"],
      ]}
      data-a2ui-action={props.action ? componentId : undefined}
    >
      {renderChild(props.child)}
    </button>
  ),

  Image: ({ props, resolve }: Ctx<typeof ImageApi>) => {
    // ImageApi has no width/height props; sizing is controlled via styles.image and the variant CSS class.
    return (
      // eslint-disable-next-line qwik/jsx-img
      <img
        class={styles.image}
        src={resolve(props.url)}
        alt={props.description ? resolve(props.description) : ""}
        style={{ objectFit: fitMap[props.fit ?? "cover"] ?? "cover" }}
      />
    );
  },

  Icon: ({ props, resolve }: Ctx<typeof IconApi>) => (
    <span
      class={styles.icon}
      aria-label={resolve(props.name)}
      data-icon={resolve(props.name)}
    />
  ),

  Divider: ({ props }: Ctx<typeof DividerApi>) => (
    <div
      class={[
        styles.divider,
        props.axis === "vertical" && styles["divider-vertical"],
      ]}
      role="separator"
    />
  ),

  TextField: ({ props, componentId, resolve }: Ctx<typeof TextFieldApi>) => {
    const inputTypes: Record<string, string> = {
      shortText: "text",
      longText: "text",
      number: "number",
      obscured: "password",
    };
    return (
      <div class={styles["text-field"]}>
        <label class={styles.label}>{resolve(props.label)}</label>
        <input
          class={styles.input}
          type={inputTypes[props.variant ?? "shortText"] ?? "text"}
          value={props.value ? resolve(props.value) : ""}
          data-a2ui-input={componentId}
        />
      </div>
    );
  },

  CheckBox: ({ props, componentId, ctx, resolve }: Ctx<typeof CheckBoxApi>) => {
    const val = props.value;
    const checked =
      typeof val === "boolean"
        ? val
        : Boolean(ctx.dataContext.resolveDynamicValue(val as never) ?? false);
    return (
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={checked}
          data-a2ui-change={`${componentId}:value`}
        />
        <span class={styles["checkbox-label"]}>{resolve(props.label)}</span>
      </label>
    );
  },

  Slider: ({ props, componentId, ctx }: Ctx<typeof SliderApi>) => {
    const val = props.value;
    const sliderVal =
      typeof val === "number"
        ? val
        : Number(ctx.dataContext.resolveDynamicValue(val as never) ?? 0);
    return (
      <input
        class={styles.slider}
        type="range"
        value={sliderVal}
        min={props.min ?? 0}
        max={props.max}
        data-a2ui-change={`${componentId}:value`}
      />
    );
  },

  Tabs: ({ props, resolve, renderChild }: Ctx<typeof TabsApi>) => (
    <ElmTabs
      tabLabels={props.tabs.map((tab) => (
        <>{resolve(tab.title)}</>
      ))}
      tabContents={props.tabs.map((tab) => renderChild(tab.child))}
    />
  ),

  Modal: ({ props, renderChild }: Ctx<typeof ModalApi>) => (
    <div class={styles.modal}>
      {renderChild(props.trigger)}
      <div class={styles["modal-content"]}>{renderChild(props.content)}</div>
    </div>
  ),

  Video: ({ props, resolve }: Ctx<typeof VideoApi>) => (
    <video class={styles.video} controls src={resolve(props.url)} />
  ),

  AudioPlayer: ({ props, resolve }: Ctx<typeof AudioPlayerApi>) => (
    <audio class={styles.audio} controls src={resolve(props.url)} />
  ),

  ChoicePicker: ({
    props,
    componentId,
    ctx,
    resolve,
  }: Ctx<typeof ChoicePickerApi>) => {
    const rawValue = props.value;
    const resolvedValue = Array.isArray(rawValue)
      ? rawValue
      : (ctx.dataContext.resolveDynamicValue(rawValue as never) ?? []);
    const selectedValues: string[] = Array.isArray(resolvedValue)
      ? (resolvedValue as string[])
      : [];
    const isMultipleSelection =
      (props.variant ?? "mutuallyExclusive") === "multipleSelection";
    return (
      <div class={styles["choice-picker"]} data-a2ui-choice={componentId}>
        {props.label ? (
          <span class={styles["choice-picker-label"]}>
            {resolve(props.label)}
          </span>
        ) : null}
        <div class={styles["choice-picker-options"]}>
          {props.options.map((opt) => {
            const optLabel = resolve(opt.label);
            const checked = selectedValues.includes(opt.value);
            return (
              <label key={opt.value} class={styles["choice-picker-option"]}>
                <input
                  type={isMultipleSelection ? "checkbox" : "radio"}
                  name={componentId}
                  value={opt.value}
                  checked={checked}
                />
                <span>{optLabel}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  },

  DateTimeInput: ({
    props,
    componentId,
    resolve,
  }: Ctx<typeof DateTimeInputApi>) => {
    const enableDate = props.enableDate ?? false;
    const enableTime = props.enableTime ?? false;
    let inputType = "text";
    if (enableDate && enableTime) inputType = "datetime-local";
    else if (enableDate) inputType = "date";
    else if (enableTime) inputType = "time";
    return (
      <div class={styles["datetime-input"]}>
        {props.label ? (
          <label class={styles.label}>{resolve(props.label)}</label>
        ) : null}
        <input
          class={styles.input}
          type={inputType}
          value={props.value ? resolve(props.value) : ""}
          min={props.min != null ? String(props.min) : undefined}
          max={props.max != null ? String(props.max) : undefined}
          data-a2ui-input={componentId}
        />
      </div>
    );
  },
};
