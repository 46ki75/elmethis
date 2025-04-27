<template>
  <thead class="elmethis-table-header-thead">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import ElmTableRow from './ElmTableRow.vue'

import { defineSlots } from 'vue'

export interface ElmTableHeaderProps {}

withDefaults(defineProps<ElmTableHeaderProps>(), {})

defineSlots<{
  default: InstanceType<typeof ElmTableRow>
}>()
</script>

<style lang="scss">
.elmethis-table-header-thead {
  text-align: left;
  transition:
    background-color 400ms,
    color 400ms;

  border-bottom: 2px solid rgba(gray, 0.5);

  tr {
    td,
    th {
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
