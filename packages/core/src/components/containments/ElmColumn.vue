<template>
  <div class="column">
    <slot />
  </div>
</template>

<script setup lang="ts">
export interface ElmColumnProps {}

withDefaults(defineProps<ElmColumnProps>(), {})
</script>

<style scoped lang="scss">
.column {
  flex: 1;
}
</style>
