<template>
  <component :is="hasHeader ? 'th' : 'td'">
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
