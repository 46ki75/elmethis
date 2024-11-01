<template>
  <thead class="elmethis-table-header-thead">
    <slot />
  </thead>
</template>

<script setup lang="ts">
export interface ElmTableHeaderProps {}

withDefaults(defineProps<ElmTableHeaderProps>(), {})
</script>

<style lang="scss">
.elmethis-table-header-thead {
  background-color: rgba(black, 0.8);
  color: rgba(white, 0.8);
  transition:
    background-color 400ms,
    color 400ms;
  [data-theme='dark'] & {
    background-color: rgba(white, 0.8);
    color: rgba(black, 0.8);
  }
}
</style>
