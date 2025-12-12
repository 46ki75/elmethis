<template>
  <thead :class="$style.thead">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import ElmTableRow from "./ElmTableRow.vue";

import { provide } from "vue";

export interface ElmTableHeaderProps {}

withDefaults(defineProps<ElmTableHeaderProps>(), {});

defineSlots<{
  default:
    | InstanceType<typeof ElmTableRow>
    | InstanceType<typeof ElmTableRow>[];
}>();

provide("hasHeader", true);
</script>

<style module lang="scss">
.thead {
  text-align: left;
  transition:
    background-color 400ms,
    color 400ms;

  border-bottom: 2px solid rgba(gray, 0.5);
}
</style>
