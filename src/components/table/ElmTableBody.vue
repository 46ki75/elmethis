<template>
  <tbody class="elmethis-table-header-body">
    <slot />
  </tbody>
</template>

<script setup lang="ts">
export interface ElmTableBodyProps {}

withDefaults(defineProps<ElmTableBodyProps>(), {})
</script>

<style lang="scss">
.elmethis-table-header-body {
  background-color: rgba(black, 0.05);
  color: rgba(black, 0.7);
  transition:
    background-color 400ms,
    color 400ms;
  [data-theme='dark'] & {
    background-color: rgba(white, 0.05);
    color: rgba(white, 0.7);
  }
}
</style>
