<template>
  <tr>
    <slot />
  </tr>
</template>

<script setup lang="ts">
export interface ElmTableRowProps {}

withDefaults(defineProps<ElmTableRowProps>(), {})
</script>

<style scoped lang="scss"></style>
