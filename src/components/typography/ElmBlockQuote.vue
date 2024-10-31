<template>
  <blockquote class="blockquote">
    <slot />
  </blockquote>
</template>

<script setup lang="ts">
export interface ElmBlockQuoteProps {}

withDefaults(defineProps<ElmBlockQuoteProps>(), {})
</script>

<style scoped lang="scss">
.blockquote {
  box-sizing: border-box;
  margin: 0;
  padding: 0.125rem 1.5rem;
  border-left: 4px solid rgba(black, 0.2);

  [data-theme='dark'] & {
    border-left-color: rgba(white, 0.2);
  }
}
</style>
