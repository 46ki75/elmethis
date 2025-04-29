<template>
  <aside
    ref="target"
    :class="$style.callout"
    :style="{
      '--border-color': colors[type].code,
      '--bg-color': rgba(colors[type].code, 0.1),
      '--scale': targetIsVisible ? 1 : 0,
    }"
  >
    <div :class="$style.header">
      <ElmMdiIcon
        :d="colors[type].icon"
        size="1.25em"
        :color="colors[type].code"
      />
      <elm-inline-text :text="type.toUpperCase()" :color="colors[type].code" />
    </div>
    <div>
      <slot />
    </div>
  </aside>
</template>

<script setup lang="ts">
import ElmInlineText from "./ElmInlineText.vue";
import { ref } from "vue";
import { rgba } from "polished";
import { useIntersectionObserver } from "@vueuse/core";

import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import {
  mdiInformation,
  mdiLightbulbOn,
  mdiShieldAlert,
  mdiAlert,
  mdiAlertOctagram,
} from "@mdi/js";

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

const colors: Record<AlertType, { code: string; icon: string }> = {
  note: { code: "#6987b8", icon: mdiInformation },
  tip: { code: "#59b57c", icon: mdiLightbulbOn },
  important: { code: "#9771bd", icon: mdiShieldAlert },
  warning: { code: "#b8a36e", icon: mdiAlert },
  caution: { code: "#b36472", icon: mdiAlertOctagram },
};

export interface ElmCalloutProps {
  /**
   * Type of alert
   */
  type?: AlertType;
}

withDefaults(defineProps<ElmCalloutProps>(), {
  type: "note",
});

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting;
});
</script>

<style module lang="scss">
.callout {
  z-index: 1;
  margin-block: 2rem;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-left: solid 4px var(--border-color);

  &::after {
    position: absolute;
    content: "";
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
    transition: transform 800ms;
    transform: scaleX(var(--scale));
    transform-origin: left;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
