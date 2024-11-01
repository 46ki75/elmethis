<template>
  <component :is="hasHeader ? 'th' : 'td'" class="cell">
    <slot />
  </component>
</template>

<script setup lang="ts">
export interface ElmTableCellProps {
  hasHeader?: boolean
}

withDefaults(defineProps<ElmTableCellProps>(), {
  hasHeader: false
})
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
