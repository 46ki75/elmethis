<template>
  <hr
    ref="target"
    :class="$style.divider"
    :style="{
      '--scale': targetIsVisible ? 1 : 0,
      '--margin-block': margin,
    }"
  />
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import type { Property } from "csstype";
import { ref } from "vue";

export interface ElmDividerProps {
  /**
   * The margin of the divider.
   */
  margin?: Property.MarginBlock;
}

withDefaults(defineProps<ElmDividerProps>(), {});

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting;
});
</script>

<style module lang="scss">
@mixin dot {
  position: absolute;
  content: "";
  height: 5px;
  width: 5px;
  top: -2px;
  border-radius: 50%;
  background-color: #555b67;

  [data-theme="dark"] & {
    background-color: #bec2ca;
  }
}

.divider {
  margin-block: var(--margin-block);
  position: relative;
  display: block;
  width: 100%;
  overflow: visible;
  border: none;
  border-bottom: 1px solid #555b67;

  transform: scaleX(var(--scale));
  transition: transform 1200ms;

  [data-theme="dark"] & {
    border-bottom-color: #bec2ca;
  }

  &::before {
    @include dot;
    left: 0;
  }

  &::after {
    @include dot;
    right: 0;
  }
}
</style>
