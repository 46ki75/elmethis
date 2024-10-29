<template>
  <span class="text">{{ text }}</span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /**
     * The text to display.
     */
    text?: string
  }>(),
  {}
)
</script>

<style scoped lang="scss">
.text {
  color: rgba(0, 0, 0, 0.7);

  &::selection {
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.7);
  }

  [data-theme='dark'] & {
    color: rgba(255, 255, 255, 0.7);

    &::selection {
      color: rgba(0, 0, 0, 0.7);
      background-color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
