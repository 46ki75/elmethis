import {
  $,
  component$,
  useId,
  useSignal,
  type Signal,
} from "@builder.io/qwik";
import {
  mdiAccount,
  mdiArchive,
  mdiBackspaceOutline,
  mdiEarth,
  mdiEmail,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiKey,
  mdiLinkVariant,
  mdiLock,
  mdiMagnify,
  mdiPen,
  mdiTag,
  mdiText,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-field.module.scss";

export interface ElmTextFieldProps {
  label: string;
  maxLength?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  value?: Signal<string>;
  icon?:
    | "text"
    | "pen"
    | "email"
    | "user"
    | "lock"
    | "key"
    | "earth"
    | "tag"
    | "archive"
    | "link"
    | "search";
  isPassword?: boolean;
  required?: boolean;
}

export const ElmTextField = component$<ElmTextFieldProps>((props) => {
  const id = useId();
  const isFocused = useSignal(false);
  const inputType = useSignal(props.isPassword ? "password" : "text");
  const internalValue = useSignal("");
  const input = props.value ?? internalValue;

  const handleDelete = $(() => {
    if (!props.loading && !props.disabled) {
      input.value = "";
    }
  });

  const handleVisibleSwitch = $(() => {
    if (!props.loading && !props.disabled) {
      inputType.value = inputType.value === "text" ? "password" : "text";
    }
  });

  const iconMap: Record<NonNullable<ElmTextFieldProps["icon"]>, string> = {
    text: mdiText,
    pen: mdiPen,
    email: mdiEmail,
    user: mdiAccount,
    lock: mdiLock,
    key: mdiKey,
    earth: mdiEarth,
    tag: mdiTag,
    archive: mdiArchive,
    link: mdiLinkVariant,
    search: mdiMagnify,
  };

  return (
    <div
      class={[styles.wrapper, isFocused.value && styles.active]}
      style={{
        backgroundColor:
          props.disabled || props.loading ? "rgba(0,0,0,0.15)" : undefined,
        "--highlight-color": isFocused.value ? "#bfa056" : undefined,
      }}
    >
      <div class={styles.header}>
        <label for={id} class={styles.label}>
          <span>{props.label}</span>
          {props.required && <span class={styles.requierd}>*</span>}
        </label>
        {props.maxLength != null && (
          <ElmInlineText
            text={`${input.value.length} / ${props.maxLength}`}
            color={input.value.length > props.maxLength ? "#c56565" : "gray"}
            size="0.75rem"
          />
        )}
      </div>

      <div class={styles.body}>
        {props.icon && (
          <ElmMdiIcon d={iconMap[props.icon]} size="1.5rem" color="gray" />
        )}

        <input
          id={id}
          bind:value={input}
          type={inputType.value}
          class={styles.input}
          placeholder={props.placeholder}
          onFocus$={() => (isFocused.value = true)}
          onBlur$={() => (isFocused.value = false)}
          disabled={props.disabled || props.loading}
          style={{
            cursor: props.disabled
              ? "not-allowed"
              : props.loading
                ? "progress"
                : "auto",
          }}
          aria-required={props.required}
        />

        <div class={styles["icon-box"]}>
          <span class={styles.suffix}>
            {props.suffix != null && <ElmInlineText text={props.suffix} />}
          </span>

          <div class={styles.icon} onClick$={handleVisibleSwitch}>
            <ElmMdiIcon
              d={inputType.value === "text" ? mdiEyeOutline : mdiEyeOffOutline}
              size="1.75em"
              color="gray"
            />
          </div>

          <div class={styles.icon} onClick$={handleDelete}>
            <ElmMdiIcon
              d={mdiBackspaceOutline}
              size="1.75em"
              color="gray"
            />
          </div>
        </div>
      </div>

      <div
        class={styles.loading}
        style={{
          opacity: props.loading ? 0.2 : 0,
        }}
      ></div>
    </div>
  );
});
