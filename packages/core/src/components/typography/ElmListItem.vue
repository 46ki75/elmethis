<template>
  <li :class="$style.li"><slot /></li>
</template>

<script setup lang="ts">
export interface ElmListItemProps {}

withDefaults(defineProps<ElmListItemProps>(), {})
</script>

<style module lang="scss">
.li {
  margin-block: 1.5rem;
}
</style>
