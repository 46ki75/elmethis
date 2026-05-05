import {
  $,
  component$,
  useComputed$,
  type CSSProperties,
  type PropFunction,
} from "@builder.io/qwik";

import { useControllableState } from "../../hooks/use-controllable-state";
import styles from "./elm-switch.module.css";

export interface ElmSwitchProps {
  class?: string;

  style?: CSSProperties;

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
  checked?: boolean;

  /**
   * Initial checked state when uncontrolled.
   */
  defaultChecked?: boolean;

  /**
   * Called whenever the checked state changes.
   */
  onCheckedChange$?: PropFunction<(checked: boolean) => void>;
}

export const ElmSwitch = component$<ElmSwitchProps>((props) => {
  const color = props.color ?? "#bfa056";
  const size = props.size ?? "18px";

  const [checked, setChecked] = useControllableState({
    prop: useComputed$(() => props.checked),
    defaultProp: props.defaultChecked ?? false,
    onChange: props.onCheckedChange$,
  });

  return (
    <div
      onClick$={$(() => {
        if (!props.disabled) {
          setChecked(!checked.value);
        }
      })}
      class={props.class}
      style={{
        "--color": color,
        "--padding": "2px",
        "--size": size,
        "--width": "calc(var(--size) * 2 + var(--padding) * 2)",
        ...props.style,
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
          checked.value && styles.checked,
          props.disabled && styles.disabled,
        ]}
      >
        <div
          class={[
            styles.circle,
            checked.value && styles.checked,
            props.disabled && styles.disabled,
          ]}
        ></div>
      </div>
    </div>
  );
});
