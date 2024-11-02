<template>
  <progress class="progress" />
  <div
    class="container"
    :style="{
      '--weight': weight
    }"
  >
    <div
      class="value"
      :style="{
        '--scale-x': `scaleX(${value / max})`
      }"
    ></div>

    <div
      class="buffer"
      :style="{
        '--scale-x': `scaleX(${buffer != null ? buffer / max : value / max})`
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'

export interface ElmProgressProps {
  value: number
  buffer?: number
  max?: number
  weight: Property.Height<string | number>
}

withDefaults(defineProps<ElmProgressProps>(), {
  max: 100,
  weight: '4px'
})
</script>

<style scoped lang="scss">
@mixin bar($transition-duration: 800ms) {
  position: absolute;
  content: '';
  width: 100%;
  height: 100%;
  background-color: black;
  transition: transform $transition-duration;
  transform: var(--scale-x, scaleX(0));
  transform-origin: left;
}

.progress {
  display: none;
}

.container {
  width: 100%;
  height: var(--weight);
  position: relative;

  background-color: rgba(black, 0.1);
  [data-theme='dark'] & {
    background-color: rgba(white, 0.1);
  }

  .value {
    @include bar;
  }

  .buffer {
    @include bar(400ms);
    opacity: 0.25;
  }
}
</style>
