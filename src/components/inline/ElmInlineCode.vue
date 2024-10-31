<template>
  <code class="code"><ElmInlineText :text="code" :color="color" /></code>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import ElmInlineText from './ElmInlineText.vue'

export interface ElmInlineCodeProps {
  /**
   * The code to display.
   */
  code: string

  /**
   * Specifies the color of the text.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
   */
  color?: Property.BackgroundColor
}

withDefaults(defineProps<ElmInlineCodeProps>(), {})
</script>

<style scoped lang="scss">
.code {
  padding: 0.25em 0.5em;
  border-radius: 0.125rem;
  background-color: rgba(0, 0, 0, 0.075);

  [data-theme='dark'] & {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
