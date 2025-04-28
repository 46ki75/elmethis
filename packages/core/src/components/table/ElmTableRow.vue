<template>
  <tr :class="[$style.tr, { [$style['has-row-header']]: hasRowHeader }]">
    <template v-for="cell in slots">
      <component :is="cell" />
    </template>
  </tr>
</template>

<script setup lang="ts">
import { inject } from "vue";
import ElmTableCell from "./ElmTableCell.vue";

export interface ElmTableRowProps {}

withDefaults(defineProps<ElmTableRowProps>(), {});

const slots = defineSlots<{
  default: InstanceType<typeof ElmTableCell>[];
}>();

const hasRowHeader = inject<boolean>("hasRowHeader");
</script>

<style module lang="scss">
.tr {
  transition: background-color 200ms;

  &:nth-child(odd) {
    background-color: transparent;
  }

  &:nth-child(even) {
    background-color: rgba(black, 0.015);
    [data-theme="dark"] & {
      background-color: rgba(white, 0.015);
    }
  }

  &:hover {
    background-color: rgba(#6987b8, 0.15);
    [data-theme="dark"] & {
      background-color: rgba(#6987b8, 0.15);
    }
  }
}

.has-row-header {
  td:first-child,
  tr:first-child {
    background-color: rgba(gray, 0.15);
  }
}
</style>
