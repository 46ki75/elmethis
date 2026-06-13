import {
  defineComponent,
  inject,
  provide,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-tabs.module.css";
import { ElmCollapse } from "./elm-collapse";
import { useBindableSignal } from "../../hooks/use-bindable-signal";
import {
  ElmTabsContext,
  useElmTabsContext,
  type ElmTabsContextValue,
} from "./tabs-context";

export interface ElmTabsProps extends HTMLAttributes {
  /**
   * Controlled selected tab value. Bind with `v-model:value`; when provided the
   * parent owns the value (prop `value` + `update:value` event).
   */
  value?: string;

  /**
   * Initial selected tab value when uncontrolled.
   */
  defaultValue?: string;

  transitionTimingFunction?: CSSProperties["transitionTimingFunction"];
}

export const ElmTabs = defineComponent({
  name: "ElmTabs",
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: "" },
    transitionTimingFunction: { type: String, default: "linear" },
  },
  emits: ["update:value"],
  setup(props, { emit, slots }) {
    const selectedValue = useBindableSignal({
      props,
      key: "value",
      emit,
      defaultValue: props.defaultValue ?? "",
    });

    const context: ElmTabsContextValue = {
      // `defaultValue` ("") guarantees a string at runtime; the model ref's type
      // widens to `string | undefined`, so narrow it back here.
      selectedValue: selectedValue as Ref<string>,
      setSelectedValue: (value: string) => {
        selectedValue.value = value;
      },
      // Getter so a reactive `transitionTimingFunction` prop stays live.
      get transitionTimingFunction() {
        return props.transitionTimingFunction;
      },
    };
    provide(ElmTabsContext, context);

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div class={clsx(styles["elm-tabs"])}>{slots.default?.()}</div>
    );
  },
});

export type ElmTabListProps = HTMLAttributes;

export const ElmTabList = defineComponent({
  name: "ElmTabList",
  setup(_, { slots }) {
    return () => (
      <div class={clsx(styles["tab-container"])}>{slots.default?.()}</div>
    );
  },
});

export interface ElmTabProps extends HTMLAttributes {
  /** Identifier matching the corresponding ElmTabPanel `value`. */
  value: string;
}

export const ElmTab = defineComponent({
  name: "ElmTab",
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useElmTabsContext(inject(ElmTabsContext));
    // inheritAttrs default: a passthrough `onClick` fires alongside ours.
    return () => (
      <div
        class={clsx(
          styles["tab"],
          ctx.selectedValue.value === props.value && styles["active"],
        )}
        onClick={() => ctx.setSelectedValue(props.value)}
      >
        {slots.default?.()}
      </div>
    );
  },
});

export interface ElmTabPanelProps extends HTMLAttributes {
  /** Identifier matching the corresponding ElmTab `value`. */
  value: string;
}

export const ElmTabPanel = defineComponent({
  name: "ElmTabPanel",
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useElmTabsContext(inject(ElmTabsContext));
    return () => (
      <div class={clsx(styles["tab-content"])}>
        <ElmCollapse
          direction="row"
          isOpen={ctx.selectedValue.value === props.value}
          transitionTimingFunction={ctx.transitionTimingFunction}
        >
          <div class={styles["tab-content-inner"]}>{slots.default?.()}</div>
        </ElmCollapse>
      </div>
    );
  },
});
