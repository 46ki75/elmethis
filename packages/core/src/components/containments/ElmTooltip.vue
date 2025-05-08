<template>
  <span
    ref="el"
    :class="$style.original"
    @mouseover="
      () => {
        isHover = true;
      }
    "
    @mouseleave="
      () => {
        isHover = false;
      }
    "
  >
    <slot name="original" />

    <transition
      :leave-from-class="$style['v-leave-from']"
      :enter-to-class="$style['v-enter-to']"
      :enter-active-class="$style['v-enter-active']"
      :leave-active-class="$style['v-leave-active']"
      :enter-from-class="$style['v-enter-from']"
      :leave-to-class="$style['v-leave-to']"
    >
      <div
        v-if="isHover"
        :class="$style.tooltip"
        :style="
          x > windowSize.width.value / 2
            ? {
                top: `${y + height}px`,
                right: `${windowSize.width.value - x - width}px`,
              }
            : {
                top: `${y + height}px`,
                left: `${x}px`,
              }
        "
      >
        <slot name="tooltip" />
      </div>
    </transition>
  </span>
</template>

<script setup lang="ts">
import { useElementBounding, useWindowSize } from "@vueuse/core";
import { ref } from "vue";

export interface ElmTooltipProps {}

withDefaults(defineProps<ElmTooltipProps>(), {});

const el = ref(null);
const { x, y, width, height } = useElementBounding(el);
const windowSize = useWindowSize();

const isHover = ref(false);
</script>

<style module lang="scss">
.tooltip {
  position: fixed;
  z-index: 1000;

  box-sizing: border-box;
  padding: 0.5rem 0;
}

.v-enter-to,
.v-leave-from {
  transform: scale(1);
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition:
    opacity 100ms,
    transform 200ms;
}

.v-enter-from,
.v-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
