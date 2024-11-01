<template>
  <th v-if="hasHeader">
    <slot />
  </th>

  <td v-else>
    <slot />
  </td>
</template>

<script setup lang="ts">
export interface ElmTableCellProps {
  hasHeader?: boolean
}

withDefaults(defineProps<ElmTableCellProps>(), {
  hasHeader: false
})
</script>

<style scoped lang="scss"></style>
