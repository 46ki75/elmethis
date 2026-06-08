import {
  $,
  component$,
  PropsOf,
  Signal,
  type CSSProperties,
} from "@qwik.dev/core";

import styles from "./elm-switch.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useBindableSignal`. Used both as a stateful form input and as a passive
// indicator reflecting upstream state, so a direct `checked: Signal<boolean>`
// binding is preferred over the controlled/uncontrolled split.
export interface ElmSwitchProps extends PropsOf<"div"> {
  /**
   * The color of the switch when checked.
   */
  color?: string;

  /**
   * The size of the switch.
   */
  size?: string;

  /**
   * Whether the switch is disabled.
   */
  disabled?: boolean;

  /**
   * Controlled checked state. When provided the parent owns the state.
   */
  checked: Signal<boolean>;
}

export const ElmSwitch = component$<ElmSwitchProps>((props) => {
  const {
    class: className,
    style,
    color,
    size,
    disabled,
    checked,
    ...rest
  } = props;
  const resolvedColor = color ?? "var(--elmethis-color-primary)";
  const resolvedSize = size ?? "18px";

  return (
    <div
      onClick$={$(() => {
        if (!props.disabled) {
          checked.value = !checked.value;
        }
      })}
      class={className}
      style={
        {
          "--elmethis-scoped-color": resolvedColor,
          "--elmethis-scoped-padding": "2px",
          "--elmethis-scoped-size": resolvedSize,
          "--elmethis-scoped-width":
            "calc(var(--elmethis-scoped-size) * 2 + var(--elmethis-scoped-padding) * 2)",
          ...(style as CSSProperties),
        } as CSSProperties
      }
      {...rest}
    >
      <input
        class={styles.switch}
        type="checkbox"
        checked={checked.value}
        disabled={disabled}
      />
      <div
        class={[
          styles.bar,
          checked.value && styles.checked,
          disabled && styles.disabled,
        ]}
      >
        <div
          class={[
            styles.circle,
            checked.value && styles.checked,
            disabled && styles.disabled,
          ]}
        ></div>
      </div>
    </div>
  );
});
