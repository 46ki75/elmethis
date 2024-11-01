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

    td,
    th {
      color: rgba(black, 0.7);
      [data-theme='dark'] & {
        color: rgba(white, 0.7);
      }

      &::selection {
        color: rgba(255, 255, 255, 0.7);
        background-color: var(--color, rgba(0, 0, 0, 0.7));
      }

      [data-theme='dark'] & {
        &::selection {
          color: rgba(0, 0, 0, 0.7);
          background-color: var(--color, rgba(255, 255, 255, 0.7));
        }
      }
    }
  }
}
</style>
