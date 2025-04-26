<template>
  <tr>
    <slot />
  </tr>
</template>

<script setup lang="ts">
import ElmTableCell from './ElmTableCell.vue'

export interface ElmTableRowProps {}

withDefaults(defineProps<ElmTableRowProps>(), {})

defineSlots<{
  default: InstanceType<typeof ElmTableCell>
}>()
</script>

<style scoped lang="scss"></style>
