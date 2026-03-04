import { $, component$, useSignal, type Signal } from "@builder.io/qwik";

import styles from "./elm-switch.module.scss";

export interface ElmSwitchProps {
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
   * Checked state.
   */
  checked?: Signal<boolean>;
}

export const ElmSwitch = component$<ElmSwitchProps>((props) => {
  const color = props.color ?? "#bfa056";
  const size = props.size ?? "18px";

  const internalChecked = useSignal(false);
  const checked = props.checked ?? internalChecked;

  const handleClick = $(() => {
    if (!props.disabled) {
      checked.value = !checked.value;
    }
  });

  return (
    <div
      onClick$={handleClick}
      style={{
        "--color": color,
        "--padding": "2px",
        "--size": size,
        "--width": "calc(var(--size) * 2 + var(--padding) * 2)",
      }}
    >
      <input
        class={styles.switch}
        type="checkbox"
        checked={checked.value}
        disabled={props.disabled}
      />
      <div
        class={[
          styles.bar,
          checked.value && styles["bar--checked"],
          props.disabled && styles["bar--disabled"],
        ]}
      >
        <div
          class={[
            styles.circle,
            checked.value && styles["circle--checked"],
            props.disabled && styles["circle--disabled"],
          ]}
        ></div>
      </div>
    </div>
  );
});
