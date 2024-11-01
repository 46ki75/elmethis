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
.cell {
  padding: 0.5rem;
  border-bottom: solid 1px rgba(black, 0.15);
}
</style>
