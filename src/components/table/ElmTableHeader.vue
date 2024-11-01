<template>
  <thead>
    <slot />
  </thead>
</template>

<script setup lang="ts">
export interface ElmTableHeaderProps {}

withDefaults(defineProps<ElmTableHeaderProps>(), {})
</script>

<style scoped lang="scss"></style>
