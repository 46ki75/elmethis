<template>
  <svg :height="radius * 2" :width="radius * 2">
    <circle
      :class="$style.circle"
      :cx="radius"
      :cy="radius"
      :r="radius - weight"
      fill="transparent"
      :strokeWidth="weight"
    />
  </svg>
</template>

<script setup lang="ts">
export interface ElmSpinnerProps {
  radius?: number;
  weight?: number;
}

withDefaults(defineProps<ElmSpinnerProps>(), {
  radius: 16,
  weight: 2,
});
</script>

<style module lang="scss">
@keyframes draw-line {
  0% {
    stroke-dashoffset: 0%;
  }
  100% {
    stroke-dashoffset: 400%;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(-180deg);
  }
}

.circle {
  stroke-dasharray: 200%;
  animation:
    draw-line 1200ms infinite ease-in-out,
    rotate 1200ms infinite linear;
  transform-origin: center;

  stroke: #555b67;
  [data-theme="dark"] & {
    stroke: #b0b5be;
  }
}
</style>
