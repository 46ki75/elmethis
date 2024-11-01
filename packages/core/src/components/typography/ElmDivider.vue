<template>
  <hr
    ref="target"
    class="divider"
    :style="{
      '--scale': targetIsVisible ? 1 : 0
    }"
  />
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ref } from 'vue'

export interface ElmDividerProps {}

withDefaults(defineProps<ElmDividerProps>(), {})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style scoped lang="scss">
@mixin dot {
  position: absolute;
  content: '';
  height: 5px;
  width: 5px;
  top: -2px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);

  [data-theme='dark'] & {
    background-color: rgba(255, 255, 255, 0.6);
  }
}

.divider {
  position: relative;
  display: block;
  width: 100%;
  overflow: visible;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.6);

  transform: scaleX(var(--scale));
  transition: transform 1200ms;

  [data-theme='dark'] & {
    border-bottom-color: rgba(255, 255, 255, 0.6);
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
