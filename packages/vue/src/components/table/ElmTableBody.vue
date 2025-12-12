<template>
  <tbody>
    <slot />
  </tbody>
</template>

<script setup lang="ts">
import ElmTableRow from "./ElmTableRow.vue";

import { provide } from "vue";

export interface ElmTableBodyProps {}

withDefaults(defineProps<ElmTableBodyProps>(), {});

defineSlots<{
  default: InstanceType<typeof ElmTableRow>[];
}>();

provide("hasHeader", false);
</script>

<style module lang="scss"></style>
