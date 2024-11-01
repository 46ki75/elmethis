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
  tr {
    transition: background-color 200ms;

    &:nth-child(odd) {
      background-color: transparent;
    }

    &:nth-child(even) {
      background-color: rgba(black, 0.025);
      [data-theme='dark'] & {
        background-color: rgba(white, 0.025);
      }
    }

    &:hover {
      background-color: rgba(#6987b8, 0.15);
      [data-theme='dark'] & {
        background-color: rgba(#6987b8, 0.15);
      }
    }
  }
}
</style>
