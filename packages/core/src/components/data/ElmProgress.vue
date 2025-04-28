<template>
  <progress :class="$style.progress" :value="value" :max="max" />

  <div
    :class="$style.container"
    :style="{
      '--weight': weight,
      '--border-radius': round ? 'calc(var(--weight) / 2)' : undefined,
      '--color': color,
    }"
  >
    <div
      :class="$style.value"
      :style="{
        '--scale-x': `scaleX(${loading ? 0 : value / max})`,
      }"
    ></div>

    <div v-if="loading" :class="$style.loading"></div>

    <div
      :class="$style.buffer"
      :style="{
        '--scale-x': `scaleX(${loading ? 0 : buffer != null ? buffer / max : value / max})`,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Property } from "csstype";

export interface ElmProgressProps {
  /**
   * The current value of the progress.
   */
  value: number;

  /**
   * The buffer value of the progress.
   */
  buffer?: number;

  /**
   * The maximum value of the progress.
   */
  max?: number;

  /**
   * The weight of the progress.
   */
  weight?: Property.Height<string | number>;

  /**
   * Whether the progress should be round.
   */
  round?: boolean;

  /**
   * The color of the progress.
   */
  color?: string;

  /**
   * Whether the progress is loading.
   */
  loading?: boolean;
}

withDefaults(defineProps<ElmProgressProps>(), {
  max: 100,
  weight: "4px",
  round: true,
  loading: false,
});
</script>

<style module lang="scss">
@mixin bar($transition-duration: 800ms) {
  position: absolute;
  content: "";
  width: 100%;
  height: 100%;
  transition: transform $transition-duration;
  transform: var(--scale-x, scaleX(0));
  transform-origin: left;
  background-color: var(--color, rgba(black, 0.8));
  [data-theme="dark"] & {
    background-color: var(--color, rgba(white, 0.8));
  }
}

.progress {
  display: none;
}

@keyframes loading {
  0% {
    transform: scaleX(0);
    transform-origin: left;
  }

  49% {
    transform: scaleX(1);
    transform-origin: left;
  }

  51% {
    transform: scaleX(1);
    transform-origin: right;
  }

  100% {
    transform: scaleX(0);
    transform-origin: right;
  }
}

.loading {
  @include bar;
  animation-name: loading;
  animation-duration: 1600ms;
  animation-iteration-count: infinite;
}

.container {
  width: 100%;
  height: var(--weight);
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;

  background-color: rgba(black, 0.1);
  [data-theme="dark"] & {
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
