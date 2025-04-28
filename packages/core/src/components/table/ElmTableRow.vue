<template>
  <tr :class="$style.tr">
    <template v-for="cell in slots">
      <component :is="cell" />
    </template>
  </tr>
</template>

<script setup lang="ts">
import ElmTableCell from "./ElmTableCell.vue";

export interface ElmTableRowProps {}

withDefaults(defineProps<ElmTableRowProps>(), {});

const slots = defineSlots<{
  default: InstanceType<typeof ElmTableCell>[];
}>();
</script>

<style module lang="scss">
.tr {
  transition: background-color 200ms;

  &:nth-child(odd) {
    background-color: transparent;
  }

  &:nth-child(even) {
    background-color: rgba(black, 0.025);
    [data-theme="dark"] & {
      background-color: rgba(white, 0.025);
    }
  }

  &:hover {
    background-color: rgba(#6987b8, 0.15);
    [data-theme="dark"] & {
      background-color: rgba(#6987b8, 0.15);
    }
  }
}
</style>
