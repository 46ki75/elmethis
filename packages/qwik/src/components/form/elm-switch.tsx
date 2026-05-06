import {
  $,
  component$,
  PropsOf,
  useComputed$,
  type CSSProperties,
  type PropFunction,
} from "@builder.io/qwik";

import { useControllableState } from "../../hooks/use-controllable-state";
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
  const { class: className, style, color, size, disabled, checked: _checked, defaultChecked, onCheckedChange$, ...rest } = props;
  const resolvedColor = color ?? "#bfa056";
  const resolvedSize = size ?? "18px";

  const [isChecked, setIsChecked] = useControllableState({
    prop: useComputed$(() => props.checked),
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange$,
  });

  return (
    <div
      onClick$={$(() => {
        if (!props.disabled) {
          setIsChecked(!isChecked.value);
        }
      })}
      class={className}
      style={{
        "--color": resolvedColor,
        "--padding": "2px",
        "--size": resolvedSize,
        "--width": "calc(var(--size) * 2 + var(--padding) * 2)",
        ...(style as CSSProperties),
      } as CSSProperties}
      {...rest}
    >
      <input
        class={styles.switch}
        type="checkbox"
        checked={isChecked.value}
        disabled={disabled}
      />
      <div
        class={[
          styles.bar,
          isChecked.value && styles.checked,
          disabled && styles.disabled,
        ]}
      >
        <div
          class={[
            styles.circle,
            isChecked.value && styles.checked,
            disabled && styles.disabled,
          ]}
        ></div>
      </div>
    </div>
  );
});
