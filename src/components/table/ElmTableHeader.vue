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

  tr {
    td,
    th {
      color: rgba(white, 0.7);
      [data-theme='dark'] & {
        color: rgba(black, 0.7);
      }

      &::selection {
        color: rgba(0, 0, 0, 0.7);
        background-color: var(--color, rgba(255, 255, 255, 0.7));
      }

      [data-theme='dark'] & {
        &::selection {
          color: rgba(255, 255, 255, 0.7);
          background-color: var(--color, rgba(0, 0, 0, 0.7));
        }
      }
    }
  }
}
</style>
