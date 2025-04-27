<template>
  <component :is="hasHeader ? 'th' : 'td'" class="cell">
    <slot v-if="text == null" />
    {{ text }}
  </component>
</template>

<script setup lang="ts">
import { defineSlots, type VNodeChild } from 'vue'

export interface ElmTableCellProps {
  /**
   * Whether the cell is a header cell.
   */
  hasHeader?: boolean

  /**
   * The text content of the cell.
   * If not provided, the cell will render its children as content.
   */
  text?: string
}

withDefaults(defineProps<ElmTableCellProps>(), {
  hasHeader: false
})

defineSlots<{
  default: VNodeChild
}>()
</script>

<style scoped lang="scss">
@mixin common-cell-styles {
  padding: 0.75rem 1rem;
}

td.cell {
  @include common-cell-styles;

  border-top: 1px solid rgba(black, 0.15);
  border-right: 1px dotted rgba(black, 0.1);

  [data-theme='dark'] & {
    border-top-color: rgba(white, 0.15);
    border-right-color: rgba(white, 0.1);
  }
}

th.cell {
  @include common-cell-styles;

  border-right: 1px dotted rgba(black, 0.15);

  [data-theme='dark'] & {
    border-right: 1px dotted rgba(white, 0.15);
  }
}
</style>
