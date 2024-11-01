<template>
  <li><slot /></li>
</template>

<script setup lang="ts">
export interface ElmListItemProps {}

withDefaults(defineProps<ElmListItemProps>(), {})
</script>
