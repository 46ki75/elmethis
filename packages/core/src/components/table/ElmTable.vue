<template>
  <table
    class="table"
    :style="{
      '--margin-block': margin
    }"
  >
    <slot v-if="slots.header != null" name="header" />
    <slot name="body" />
  </table>
</template>

<script setup lang="ts">
import ElmTableHeader from './ElmTableHeader.vue'
import ElmTableBody from './ElmTableBody.vue'

import type { Property } from 'csstype'
import { defineSlots } from 'vue'

export interface ElmTableProps {
  /**
   * The margin of the table.
   */
  margin?: Property.MarginBlock
}

withDefaults(defineProps<ElmTableProps>(), {})

const slots = defineSlots<{
  /**
   * (Optional) The header slot of the table.
   */
  header?: InstanceType<typeof ElmTableHeader>

  /**
   * The body slot of the table.
   */
  body: InstanceType<typeof ElmTableBody>
}>()
</script>

<style scoped lang="scss">
.table {
  margin-block: var(--margin-block);
  border-collapse: collapse;
  border-spacing: 0;
  box-shadow: 0 0 0.125rem rgba(black, 0.2);
  overflow: hidden;
  border-radius: 0.125rem;
}
</style>
