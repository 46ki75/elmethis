<template>
  <svg viewBox="0 0 24 24" :width="size" :height="size">
    <path :d="d" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
export interface ElmMdiIconProps {
  size?: string;
  d: string;
}

withDefaults(defineProps<ElmMdiIconProps>(), {
  size: "1em",
});
</script>

<style module lang="scss"></style>
