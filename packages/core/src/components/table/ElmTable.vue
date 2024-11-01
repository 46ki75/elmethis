<template>
  <table class="table">
    <slot />
  </table>
</template>

<script setup lang="ts">
export interface ElmTableProps {}

withDefaults(defineProps<ElmTableProps>(), {})
</script>

<style scoped lang="scss">
.table {
  border-collapse: collapse;
  border-spacing: 0;
  box-shadow: 0 0 0.125rem rgba(black, 0.1);
}
</style>
