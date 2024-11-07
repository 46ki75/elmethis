<template>
  <table
    class="table"
    :style="{
      '--margin-block': margin
    }"
  >
    <slot />
  </table>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'

export interface ElmTableProps {
  /**
   * The margin of the table.
   */
  margin?: Property.MarginBlock
}

withDefaults(defineProps<ElmTableProps>(), {})
</script>

<style scoped lang="scss">
.table {
  margin-block: var(--margin-block);
  border-collapse: collapse;
  border-spacing: 0;
  box-shadow: 0 0 0.125rem rgba(black, 0.1);
}
</style>
