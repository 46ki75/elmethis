<template>
  <svg
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    focusable="false"
    role="img"
    :class="$style.icon"
    :style="{
      '--color': lightColor ?? color,
      '--dark-color': darkColor ?? color,
    }"
  >
    <path :d="d" />
  </svg>
</template>

<script setup lang="ts">
export interface ElmMdiIconProps {
  size?: string;
  d: string;
  color?: string;
  lightColor?: string;
  darkColor?: string;
}

withDefaults(defineProps<ElmMdiIconProps>(), {
  size: "1em",
});
</script>

<style module lang="scss">
.icon {
  fill: var(--color, #333);

  [data-theme="dark"] & {
    fill: var(--dark-color, #ccc);
  }
}
</style>
