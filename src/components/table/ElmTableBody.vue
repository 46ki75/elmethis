<template>
  <tbody>
    <slot />
  </tbody>
</template>

<script setup lang="ts">
export interface ElmTableBodyProps {}

withDefaults(defineProps<ElmTableBodyProps>(), {})
</script>

<style scoped lang="scss"></style>
