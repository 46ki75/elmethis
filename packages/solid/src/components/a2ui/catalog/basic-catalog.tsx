import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";

import {
  AudioPlayerApi,
  BASIC_FUNCTIONS,
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
import { ElmModal } from "../../containments/elm-modal";
import { ElmHeading } from "../../typography/elm-heading";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { ElmParagraph } from "../../typography/elm-paragraph";
import styles from "../elm-a2ui.module.css";
import {
  CatalogRenderer,
  defineRenderer,
  type SolidRendererEntry,
} from "./catalog";
import {
  alignItemsMap,
  justifyContentMap,
  objectFitMap,
} from "./catalog-utils";
import { RenderIndexedChild } from "./render-indexed-child";

const textFieldInputType: Record<string, string> = {
  shortText: "text",
  number: "number",
  obscured: "password",
};

const headingLevel = (variant: string): 1 | 2 | 3 | 4 | 5 => {
  const level = Number(variant.slice(1));
  return level >= 1 && level <= 5 ? (level as 1 | 2 | 3 | 4 | 5) : 1;
};

interface ValidationErrorsProps {
  errors?: string[];
  id: string;
}

const ValidationErrors = (props: ValidationErrorsProps) => (
  <Show when={props.errors?.length}>
    <ul id={props.id} class={styles["validation-errors"]} aria-live="polite">
      <For each={props.errors}>{(error) => <li>{error}</li>}</For>
    </ul>
  </Show>
);

export const basicComponents: SolidRendererEntry[] = [
  defineRenderer(TextApi, (props) => (
    <Switch
      fallback={
        <ElmHeading level={headingLevel(props.props.variant ?? "h1")}>
          {props.props.text}
        </ElmHeading>
      }
    >
      <Match when={props.props.variant === "caption"}>
        <ElmInlineText>{props.props.text}</ElmInlineText>
      </Match>
      <Match when={(props.props.variant ?? "body") === "body"}>
        <ElmParagraph>{props.props.text}</ElmParagraph>
      </Match>
    </Switch>
  )),
  defineRenderer(RowApi, (props) => (
    <div
      class={styles.row}
      style={{
        "justify-content": justifyContentMap[props.props.justify ?? "start"],
        "align-items": alignItemsMap[props.props.align ?? "center"],
      }}
    >
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </div>
  )),
  defineRenderer(ColumnApi, (props) => (
    <div class={styles.column}>
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </div>
  )),
  defineRenderer(ListApi, (props) => (
    <div
      class={styles.list}
      classList={{
        [styles["list-horizontal"]]: props.props.direction === "horizontal",
      }}
    >
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <div class={styles["list-item"]}>
            <RenderIndexedChild
              child={child}
              index={index}
              renderChild={props.renderChild}
            />
          </div>
        )}
      </For>
    </div>
  )),
  defineRenderer(CardApi, (props) => (
    <div class={styles.card}>{props.renderChild(props.props.child)}</div>
  )),
  defineRenderer(ButtonApi, (props) => {
    const errorId = () => `${props.instanceId}-errors`;
    const isDisabled = () => props.props.isValid === false;
    return (
      <div class={styles["action-control"]}>
        <div
          role="button"
          tabIndex={isDisabled() ? -1 : 0}
          aria-disabled={isDisabled()}
          aria-describedby={isDisabled() ? errorId() : undefined}
          class={styles.button}
          classList={{
            [styles["button-primary"]]: props.props.variant === "primary",
            [styles["button-disabled"]]: isDisabled(),
          }}
          onClick={() => {
            if (!isDisabled()) props.props.action?.();
          }}
          onKeyDown={(event) => {
            if (!isDisabled() && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              props.props.action?.();
            }
          }}
        >
          {props.renderChild(props.props.child)}
        </div>
        <ValidationErrors
          id={errorId()}
          errors={props.props.validationErrors}
        />
      </div>
    );
  }),
  defineRenderer(ImageApi, (props) => (
    <img
      class={styles.image}
      src={props.props.url}
      alt={props.props.description ?? ""}
      style={{ "object-fit": objectFitMap[props.props.fit ?? "cover"] }}
    />
  )),
  defineRenderer(IconApi, (props) => {
    const name = createMemo(() =>
      typeof props.props.name === "string" ? props.props.name : "custom",
    );
    const svgPath = createMemo(() =>
      typeof props.props.name === "object" &&
      props.props.name != null &&
      "svgPath" in props.props.name
        ? props.props.name.svgPath
        : undefined,
    );
    return (
      <Show
        when={svgPath()}
        fallback={
          <span class={styles.icon} aria-label={name()} data-icon={name()} />
        }
      >
        {(path) => (
          <svg class={styles.icon} viewBox="0 0 24 24" aria-label={name()}>
            <path d={path()} />
          </svg>
        )}
      </Show>
    );
  }),
  defineRenderer(DividerApi, (props) => (
    <div
      class={styles.divider}
      classList={{
        [styles["divider-vertical"]]: props.props.axis === "vertical",
      }}
      role="separator"
    />
  )),
  defineRenderer(TextFieldApi, (props) => (
    <div class={styles["text-field"]}>
      <label class={styles.label} for={`${props.instanceId}-input`}>
        {props.props.label}
      </label>
      <Show
        when={props.props.variant === "longText"}
        fallback={
          <input
            id={`${props.instanceId}-input`}
            class={styles.input}
            aria-invalid={props.props.isValid === false}
            aria-describedby={
              props.props.isValid === false
                ? `${props.instanceId}-errors`
                : undefined
            }
            type={
              textFieldInputType[props.props.variant ?? "shortText"] ?? "text"
            }
            value={props.props.value ?? ""}
            onInput={(event) => props.props.setValue(event.currentTarget.value)}
          />
        }
      >
        <textarea
          id={`${props.instanceId}-input`}
          class={styles.input}
          aria-invalid={props.props.isValid === false}
          aria-describedby={
            props.props.isValid === false
              ? `${props.instanceId}-errors`
              : undefined
          }
          value={props.props.value ?? ""}
          onInput={(event) => props.props.setValue(event.currentTarget.value)}
        />
      </Show>
      <ValidationErrors
        id={`${props.instanceId}-errors`}
        errors={props.props.validationErrors}
      />
    </div>
  )),
  defineRenderer(CheckBoxApi, (props) => (
    <div class={styles["checkable-control"]}>
      <label class={styles.checkbox}>
        <input
          type="checkbox"
          checked={Boolean(props.props.value)}
          aria-invalid={props.props.isValid === false}
          aria-describedby={
            props.props.isValid === false
              ? `${props.instanceId}-errors`
              : undefined
          }
          onChange={(event) =>
            props.props.setValue(event.currentTarget.checked)
          }
        />
        <span class={styles["checkbox-label"]}>{props.props.label}</span>
      </label>
      <ValidationErrors
        id={`${props.instanceId}-errors`}
        errors={props.props.validationErrors}
      />
    </div>
  )),
  defineRenderer(SliderApi, (props) => (
    <div class={styles["checkable-control"]}>
      <input
        class={styles.slider}
        type="range"
        value={Number(props.props.value ?? 0)}
        min={props.props.min ?? 0}
        max={props.props.max}
        step={props.props.step}
        aria-invalid={props.props.isValid === false}
        aria-describedby={
          props.props.isValid === false
            ? `${props.instanceId}-errors`
            : undefined
        }
        onInput={(event) =>
          props.props.setValue(Number(event.currentTarget.value))
        }
      />
      <ValidationErrors
        id={`${props.instanceId}-errors`}
        errors={props.props.validationErrors}
      />
    </div>
  )),
  defineRenderer(TabsApi, (props) => (
    <ElmTabs defaultValue="0">
      <ElmTabList>
        <For each={props.props.tabs}>
          {(tab, index) => (
            <ElmTab value={String(index())}>{String(tab.title)}</ElmTab>
          )}
        </For>
      </ElmTabList>
      <For each={props.props.tabs}>
        {(tab, index) => (
          <ElmTabPanel value={String(index())}>
            {props.renderChild(tab.child)}
          </ElmTabPanel>
        )}
      </For>
    </ElmTabs>
  )),
  defineRenderer(ModalApi, (props) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const open = () => setIsOpen(true);
    return (
      <>
        <div
          class={styles["modal-trigger"]}
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              open();
            }
          }}
        >
          {props.renderChild(props.props.trigger)}
        </div>
        <Show when={isOpen()}>
          <ElmModal isOpen delay={0} onClose={() => setIsOpen(false)}>
            {props.renderChild(props.props.content)}
          </ElmModal>
        </Show>
      </>
    );
  }),
  defineRenderer(VideoApi, (props) => (
    <video class={styles.video} controls src={props.props.url} />
  )),
  defineRenderer(AudioPlayerApi, (props) => (
    <audio class={styles.audio} controls src={props.props.url} />
  )),
  defineRenderer(ChoicePickerApi, (props) => {
    const selected = createMemo(() =>
      Array.isArray(props.props.value) ? props.props.value : [],
    );
    const multiple = createMemo(
      () => props.props.variant === "multipleSelection",
    );
    return (
      <div class={styles["choice-picker"]}>
        <Show when={props.props.label}>
          <span class={styles["choice-picker-label"]}>{props.props.label}</span>
        </Show>
        <div class={styles["choice-picker-options"]}>
          <For each={props.props.options}>
            {(option) => (
              <label class={styles["choice-picker-option"]}>
                <input
                  type={multiple() ? "checkbox" : "radio"}
                  name={`${props.instanceId}-choice`}
                  value={option.value}
                  checked={selected().includes(option.value)}
                  aria-invalid={props.props.isValid === false}
                  aria-describedby={
                    props.props.isValid === false
                      ? `${props.instanceId}-errors`
                      : undefined
                  }
                  onChange={(event) => {
                    const next = multiple()
                      ? event.currentTarget.checked
                        ? [...selected(), option.value]
                        : selected().filter(
                            (value: string) => value !== option.value,
                          )
                      : [option.value];
                    props.props.setValue(next);
                  }}
                />
                <span>{String(option.label)}</span>
              </label>
            )}
          </For>
        </div>
        <ValidationErrors
          id={`${props.instanceId}-errors`}
          errors={props.props.validationErrors}
        />
      </div>
    );
  }),
  defineRenderer(DateTimeInputApi, (props) => {
    const type = createMemo(() =>
      props.props.enableDate && props.props.enableTime
        ? "datetime-local"
        : props.props.enableDate
          ? "date"
          : props.props.enableTime
            ? "time"
            : "text",
    );
    return (
      <div class={styles["datetime-input"]}>
        <Show when={props.props.label}>
          <label class={styles.label}>{props.props.label}</label>
        </Show>
        <input
          class={styles.input}
          type={type()}
          value={props.props.value ?? ""}
          min={props.props.min == null ? undefined : String(props.props.min)}
          max={props.props.max == null ? undefined : String(props.props.max)}
          aria-invalid={props.props.isValid === false}
          aria-describedby={
            props.props.isValid === false
              ? `${props.instanceId}-errors`
              : undefined
          }
          onInput={(event) => props.props.setValue(event.currentTarget.value)}
        />
        <ValidationErrors
          id={`${props.instanceId}-errors`}
          errors={props.props.validationErrors}
        />
      </div>
    );
  }),
];

export const basicFunctions = [...BASIC_FUNCTIONS];
export const basicCatalog = new CatalogRenderer(
  basicComponents,
  basicFunctions,
);
