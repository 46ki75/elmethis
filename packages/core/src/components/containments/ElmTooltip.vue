<template>
  <span
    ref="el"
    :class="$style.original"
    @mouseover="
      () => {
        isHover = true
      }
    "
    @mouseleave="
      () => {
        isHover = false
      }
    "
  >
    <slot name="original" />

    <transition>
      <div
        v-if="isHover"
        :class="$style.tooltip"
        :style="
          x > windowSize.width.value / 2
            ? {
                top: `${y + height}px`,
                right: `${windowSize.width.value - x - width}px`
              }
            : {
                top: `${y + height}px`,
                left: `${x}px`
              }
        "
      >
        <slot name="tooltip" />
      </div>
    </transition>
  </span>
</template>

<script setup lang="ts">
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { ref } from 'vue'

export interface ElmTooltipProps {}

withDefaults(defineProps<ElmTooltipProps>(), {})

const el = ref(null)
const { x, y, width, height } = useElementBounding(el)
const windowSize = useWindowSize()

const isHover = ref(false)
</script>

<style module lang="scss">
.tooltip {
  position: fixed;
  z-index: 1000;

  box-sizing: border-box;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;

  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.1);

  color: rgba(0, 0, 0, 0.7);
  background-color: rgba(255, 255, 255, 0.9);

  transform-origin: top;

  [data-theme='dark'] & {
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.9);
  }
}
</style>

<style scoped lang="scss">
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
  transform: scale(0.5);
  opacity: 0;
}
</style>
