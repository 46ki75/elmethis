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

  border-bottom: solid 1px rgba(black, 0.15);
  border-right: dotted 1px rgba(black, 0.1);

  [data-theme='dark'] & {
    border-bottom-color: rgba(white, 0.15);
    border-right-color: rgba(white, 0.1);
  }
}

th.cell {
  @include common-cell-styles;

  border-right: dotted 1px rgba(white, 0.25);

  [data-theme='dark'] & {
    border-right: dotted 1px rgba(black, 0.25);
  }
}
</style>
