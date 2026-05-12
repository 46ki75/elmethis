import {
  $,
  component$,
  PropsOf,
  Signal,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./elm-switch.module.css";

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
  const resolvedColor = color ?? "#bfa056";
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
          "--color": resolvedColor,
          "--padding": "2px",
          "--size": resolvedSize,
          "--width": "calc(var(--size) * 2 + var(--padding) * 2)",
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
