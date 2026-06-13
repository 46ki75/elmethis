import { defineComponent, type CSSProperties, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-switch.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useBindableSignal`. Used both as a stateful form input and as a passive
// indicator reflecting upstream state, so a direct controlled `checked` /
// `v-model:checked` binding is preferred over the controlled/uncontrolled split.
export interface ElmSwitchProps extends Omit<HTMLAttributes, "onClick"> {
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
   * Controlled checked state. Bind with `v-model:checked`; the parent owns the
   * value (prop `checked` + `update:checked` event).
   */
  checked: boolean;
}

export const ElmSwitch = defineComponent({
  name: "ElmSwitch",
  props: {
    color: { type: String, default: undefined },
    size: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    checked: { type: Boolean, required: true },
  },
  emits: ["update:checked"],
  setup(props, { emit }) {
    // inheritAttrs default: passthrough class/style merge onto the root; the
    // scoped CSS custom properties below merge with any passthrough style.
    return () => {
      const resolvedColor = props.color ?? "var(--elmethis-color-primary)";
      const resolvedSize = props.size ?? "18px";

      return (
        <div
          onClick={() => {
            if (!props.disabled) {
              emit("update:checked", !props.checked);
            }
          }}
          style={
            {
              "--elmethis-scoped-color": resolvedColor,
              "--elmethis-scoped-padding": "2px",
              "--elmethis-scoped-size": resolvedSize,
              "--elmethis-scoped-width":
                "calc(var(--elmethis-scoped-size) * 2 + var(--elmethis-scoped-padding) * 2)",
            } as CSSProperties
          }
        >
          <input
            class={styles.switch}
            type="checkbox"
            checked={props.checked}
            disabled={props.disabled}
          />
          <div
            class={clsx(
              styles.bar,
              props.checked && styles.checked,
              props.disabled && styles.disabled,
            )}
          >
            <div
              class={clsx(
                styles.circle,
                props.checked && styles.checked,
                props.disabled && styles.disabled,
              )}
            ></div>
          </div>
        </div>
      );
    };
  },
});
