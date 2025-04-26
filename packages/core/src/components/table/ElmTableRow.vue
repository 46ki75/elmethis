<template>
  <tr>
    <template v-for="cell in slots">
      <component :is="cell" />
    </template>
  </tr>
</template>

<script setup lang="ts">
import ElmTableCell from './ElmTableCell.vue'

export interface ElmTableRowProps {}

withDefaults(defineProps<ElmTableRowProps>(), {})

const slots = defineSlots<{
  default: InstanceType<typeof ElmTableCell>[]
}>()
</script>

<style scoped lang="scss"></style>
