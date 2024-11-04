<template>
  <div :class="$style.column">
    <slot />
  </div>
</template>

<script setup lang="ts">
export interface ElmColumnProps {}

withDefaults(defineProps<ElmColumnProps>(), {})
</script>

<style module lang="scss">
.column {
  flex: 1;
}
</style>
