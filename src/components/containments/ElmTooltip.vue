<template>
  <span
    ref="el"
    class="original"
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
  </span>

  <transition>
    <div
      v-if="isHover"
      class="tooltip"
      :style="{
        top: `${y + height}px`,
        left: `${x}px`
      }"
    >
      <slot name="tooltip" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { ref } from 'vue'

withDefaults(defineProps<{}>(), {})

const el = ref(null)
const { x, y, height } = useElementBounding(el)

const isHover = ref(false)
</script>

<style scoped lang="scss">
.tooltip {
  position: fixed;
  z-index: 1000;

  box-sizing: border-box;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;

  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.1);

  color: rgba(0, 0, 0, 0.7);
  background-color: rgba(255, 255, 255, 0.7);

  [data-theme='dark'] & {
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 100ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
