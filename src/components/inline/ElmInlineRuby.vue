<template>
  <ruby>
    <ElmInlineText :text="text" :color="color" />
    <rt><ElmInlineText :text="ruby" :color="color" /></rt>
  </ruby>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import ElmInlineText from './ElmInlineText.vue'

export interface ElmInlineRubyProps {
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
   * The ruby text to display.
   */
  ruby: string
}

withDefaults(defineProps<ElmInlineRubyProps>(), {})
</script>

<style scoped lang="scss"></style>
