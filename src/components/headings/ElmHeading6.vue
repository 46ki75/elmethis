<template>
  <h6 class="h2" :id="id ?? kebabCase(text)" :style="{ '--font-size': size }">
    {{ text }}
  </h6>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { kebabCase } from 'lodash-es'

withDefaults(
  defineProps<{
    /**
     * Text to display
     */
    text: string

    /**
     * Font size of the text. Default is `'1.1rem'`.
     */
    size?: Property.FontSize

    /**
     * ID of the heading element.
     * Default is kebab-cased `text`. (using lodash)
     */
    id?: string
  }>(),
  {
    size: '1.1rem'
  }
)
</script>

<style scoped lang="scss">
.h2 {
  font-size: var(--font-size);

  transition: color 400ms;

  color: rgba(0, 0, 0, 0.8);
  &::selection {
    color: rgba(255, 255, 255, 0.8);
    background-color: rgba(0, 0, 0, 0.8);
  }

  [data-theme='dark'] & {
    color: rgba(255, 255, 255, 0.8);

    &::selection {
      color: rgba(0, 0, 0, 0.8);
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
