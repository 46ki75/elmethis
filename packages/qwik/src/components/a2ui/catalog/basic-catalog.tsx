/**
 * Built-in renderer set for the A2UI v0.9 Basic Catalog
 * (`https://a2ui.org/specification/v0_9/basic_catalog.json`).
 *
 * Each entry is a typed `defineRenderer(api, fn)`. Interactive components
 * write back to the data model via the `setBinding$` QRL provided by
 * `ComponentHost`, and fire actions via `dispatchAction$`. Both are baked
 * with the host's surface + component id, so renderers stay free of
 * surface-level coupling.
 */
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

import {
  ElmTab,
  ElmTabList,
  ElmTabPanel,
  ElmTabs,
} from "../../containments/elm-tabs";
import { ElmHeading } from "../../typography/elm-heading";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { ElmParagraph } from "../../typography/elm-paragraph";
import styles from "../elm-a2ui.module.css";

import { CatalogRenderer, defineRenderer } from "./catalog";
import {
  alignItemsMap,
  justifyContentMap,
  objectFitMap,
} from "./catalog-utils";

const textFieldInputType: Record<string, string> = {
  shortText: "text",
  number: "number",
  obscured: "password",
};

function headingLevel(variant: string): 1 | 2 | 3 | 4 | 5 {
  switch (variant) {
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
}

export const basicCatalog: CatalogRenderer = new CatalogRenderer([
  defineRenderer(TextApi, ({ props, resolve }) => {
    const text = resolve(props.text);
    const variant = props.variant ?? "body";
    if (variant === "caption") return <ElmInlineText>{text}</ElmInlineText>;
    if (variant === "body") return <ElmParagraph>{text}</ElmParagraph>;
    return <ElmHeading level={headingLevel(variant)}>{text}</ElmHeading>;
  }),

  defineRenderer(RowApi, ({ props, childRefs, renderChild }) => (
    <div
      class={styles.row}
      style={{
        justifyContent: justifyContentMap[props.justify ?? "start"],
        alignItems: alignItemsMap[props.align ?? "center"],
      }}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`} class={styles["child-wrap"]}>
          {renderChild(id, path, i)}
        </span>
      ))}
    </div>
  )),

  defineRenderer(ColumnApi, ({ props, childRefs, renderChild }) => (
    <div class={styles.column} style={{ "--margin-block": "2rem" }}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`} class={styles["child-wrap"]}>
          {renderChild(id, path, i)}
        </span>
      ))}
    </div>
  )),

  defineRenderer(ListApi, ({ props, childRefs, renderChild }) => (
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
  )),

  defineRenderer(CardApi, ({ props, renderChild }) => (
    <div class={styles.card}>{renderChild(props.child)}</div>
  )),

  // Rendered as a div-with-role rather than a native <button> because the
  // A2UI `child` can be any component (Row, Column, Card, etc.), and those
  // render <div>s. <div> inside <button> is invalid HTML and trips Qwik v2's
  // SSR validator (Q12).
  defineRenderer(ButtonApi, ({ props, renderChild, dispatchAction$ }) => (
    <div
      role="button"
      tabIndex={0}
      class={[
        styles.button,
        props.variant === "primary" && styles["button-primary"],
      ]}
      onClick$={props.action ? () => dispatchAction$("action") : undefined}
      onKeyDown$={
        props.action
          ? (e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                return dispatchAction$("action");
              }
            }
          : undefined
      }
    >
      {renderChild(props.child)}
    </div>
  )),

  defineRenderer(ImageApi, ({ props, resolve }) => (
    // eslint-disable-next-line qwik/jsx-img
    <img
      class={styles.image}
      src={resolve(props.url)}
      alt={props.description ? resolve(props.description) : ""}
      style={{ objectFit: objectFitMap[props.fit ?? "cover"] }}
    />
  )),

  defineRenderer(IconApi, ({ props, resolve }) => {
    const name = resolve(props.name);
    return <span class={styles.icon} aria-label={name} data-icon={name} />;
  }),

  defineRenderer(DividerApi, ({ props }) => (
    <div
      class={[
        styles.divider,
        props.axis === "vertical" && styles["divider-vertical"],
      ]}
      role="separator"
    />
  )),

  defineRenderer(TextFieldApi, ({ props, resolve, setBinding$ }) => {
    const variant = props.variant ?? "shortText";
    const value = props.value ? resolve(props.value) : "";
    return (
      <div class={styles["text-field"]}>
        <label class={styles.label}>{resolve(props.label)}</label>
        {variant === "longText" ? (
          <textarea
            class={styles.input}
            value={value}
            onInput$={(_e: Event, el: HTMLTextAreaElement) =>
              setBinding$("value", el.value)
            }
            onChange$={(_e: Event, el: HTMLTextAreaElement) =>
              setBinding$("value", el.value)
            }
          />
        ) : (
          <input
            class={styles.input}
            type={textFieldInputType[variant] ?? "text"}
            value={value}
            onInput$={(_e: Event, el: HTMLInputElement) =>
              setBinding$("value", el.value)
            }
            onChange$={(_e: Event, el: HTMLInputElement) =>
              setBinding$("value", el.value)
            }
          />
        )}
      </div>
    );
  }),

  defineRenderer(CheckBoxApi, ({ props, ctx, resolve, setBinding$ }) => {
    const raw = props.value;
    const checked =
      typeof raw === "boolean"
        ? raw
        : Boolean(ctx.dataContext.resolveDynamicValue(raw as never) ?? false);
    return (
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={checked}
          onChange$={(_e: Event, el: HTMLInputElement) =>
            setBinding$("value", el.checked)
          }
        />
        <span class={styles["checkbox-label"]}>{resolve(props.label)}</span>
      </label>
    );
  }),

  defineRenderer(SliderApi, ({ props, ctx, setBinding$ }) => {
    const raw = props.value;
    const value =
      typeof raw === "number"
        ? raw
        : Number(ctx.dataContext.resolveDynamicValue(raw as never) ?? 0);
    return (
      <input
        class={styles.slider}
        type="range"
        value={value}
        min={props.min ?? 0}
        max={props.max}
        onInput$={(_e: Event, el: HTMLInputElement) =>
          setBinding$("value", Number(el.value))
        }
        onChange$={(_e: Event, el: HTMLInputElement) =>
          setBinding$("value", Number(el.value))
        }
      />
    );
  }),

  defineRenderer(TabsApi, ({ props, resolve, renderChild }) => (
    <ElmTabs defaultValue="0">
      <ElmTabList>
        {props.tabs.map((tab, idx) => (
          <ElmTab key={idx} value={String(idx)}>
            {resolve(tab.title)}
          </ElmTab>
        ))}
      </ElmTabList>
      {props.tabs.map((tab, idx) => (
        <ElmTabPanel key={idx} value={String(idx)}>
          {renderChild(tab.child)}
        </ElmTabPanel>
      ))}
    </ElmTabs>
  )),

  defineRenderer(ModalApi, ({ props, renderChild }) => (
    <div class={styles.modal}>
      {renderChild(props.trigger)}
      <div class={styles["modal-content"]}>{renderChild(props.content)}</div>
    </div>
  )),

  defineRenderer(VideoApi, ({ props, resolve }) => (
    <video class={styles.video} controls src={resolve(props.url)} />
  )),

  defineRenderer(AudioPlayerApi, ({ props, resolve }) => (
    <audio class={styles.audio} controls src={resolve(props.url)} />
  )),

  defineRenderer(
    ChoicePickerApi,
    ({ props, componentId, ctx, resolve, setBinding$ }) => {
      const raw = props.value;
      const resolvedArr = Array.isArray(raw)
        ? raw
        : (ctx.dataContext.resolveDynamicValue(raw as never) ?? []);
      const selected: string[] = Array.isArray(resolvedArr)
        ? (resolvedArr as string[])
        : [];
      const multi =
        (props.variant ?? "mutuallyExclusive") === "multipleSelection";

      // Single wrapper-level handler instead of per-input handlers.
      // Reason: an `onChange$` inside an array iteration drags the
      // entire renderer scope into Qwik's dev-mode QRL captures map
      // and trips Q3 on the `resolve` arg even when the body doesn't
      // reference it. Wrapper-level delegation gives Qwik exactly one
      // QRL to verify. We probe `multi` from the DOM (input type) to
      // avoid capturing the renderer's `multi` boolean — eslint's
      // `qwik/valid-lexical-scope` rule infers the strict-equal result
      // as Symbol from the typed variant union.
      return (
        <div
          class={styles["choice-picker"]}
          data-choice-picker={componentId}
          onChange$={(_e: Event, wrapper: HTMLDivElement) => {
            const inputs = wrapper.querySelectorAll<HTMLInputElement>("input");
            const isMulti = inputs.length > 0 && inputs[0]!.type === "checkbox";
            const checked = Array.from(
              wrapper.querySelectorAll<HTMLInputElement>("input:checked"),
            ).map((i) => i.value);
            // For single-select radios the browser keeps exactly one
            // input checked, so `checked` is already the right shape.
            return setBinding$(
              "value",
              isMulti ? checked : checked.slice(0, 1),
            );
          }}
        >
          {props.label ? (
            <span class={styles["choice-picker-label"]}>
              {resolve(props.label)}
            </span>
          ) : null}
          <div class={styles["choice-picker-options"]}>
            {props.options.map((opt) => (
              <label key={opt.value} class={styles["choice-picker-option"]}>
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={componentId}
                  value={opt.value}
                  checked={selected.includes(opt.value)}
                />
                <span>{resolve(opt.label)}</span>
              </label>
            ))}
          </div>
        </div>
      );
    },
  ),

  defineRenderer(DateTimeInputApi, ({ props, resolve, setBinding$ }) => {
    const enableDate = props.enableDate ?? false;
    const enableTime = props.enableTime ?? false;
    const inputType =
      enableDate && enableTime
        ? "datetime-local"
        : enableDate
          ? "date"
          : enableTime
            ? "time"
            : "text";
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
          onInput$={(_e: Event, el: HTMLInputElement) =>
            setBinding$("value", el.value)
          }
          onChange$={(_e: Event, el: HTMLInputElement) =>
            setBinding$("value", el.value)
          }
        />
      </div>
    );
  }),
]);
