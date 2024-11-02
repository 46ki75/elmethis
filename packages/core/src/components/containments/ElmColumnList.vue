<template>
  <div class="column-list">
    <slot />
  </div>
</template>

<script setup lang="ts">
export interface ElmColumnListProps {}

withDefaults(defineProps<ElmColumnListProps>(), {})
</script>

<style scoped lang="scss">
.column-list {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>
