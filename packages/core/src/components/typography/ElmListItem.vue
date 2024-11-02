<template>
  <li class="li"><slot /></li>
</template>

<script setup lang="ts">
export interface ElmListItemProps {}

withDefaults(defineProps<ElmListItemProps>(), {})
</script>

<style scoped lang="scss">
.li {
  margin-block: 1.5rem;
}
</style>
