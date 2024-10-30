<template>
  <span class="text" :style="{ '--color': color, '--font-size': size }">{{
    text
  }}</span>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'

withDefaults(
  defineProps<{
    /**
     * The text to display.
     */
    text: string

    /**
     * Specifies the color of the text.
     *
     * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
     */
    color?: Property.BackgroundColor

    /**
     * Specifies the font size of the text.
     */
    size?: Property.FontSize
  }>(),
  {}
)
</script>

<style scoped lang="scss">
.text {
  color: var(--color, rgba(0, 0, 0, 0.7));
  font-size: var(--font-size);

  &::selection {
    color: rgba(255, 255, 255, 0.7);
    background-color: var(--color, rgba(0, 0, 0, 0.7));
  }

  [data-theme='dark'] & {
    color: var(--color, rgba(255, 255, 255, 0.7));

    &::selection {
      color: rgba(0, 0, 0, 0.7);
      background-color: var(--color, rgba(255, 255, 255, 0.7));
    }
  }
}
</style>
