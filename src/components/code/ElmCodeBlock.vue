<template>
  <div class="wrapper">
    <div class="header">{{ caption ?? language }}</div>
    <elm-prism-highlighter :code="code" :language="language" />
  </div>
</template>

<script setup lang="ts">
import ElmPrismHighlighter from './ElmPrismHighlighter.vue'

export interface ElmCodeBlockProps {
  /**
   * The code to display.
   */
  code: string

  /**
   * The language of the code.
   */
  language?: string

  /**
   * The caption of the code block.
   * If not provided, the language will be used.
   */
  caption?: string
}

withDefaults(defineProps<ElmCodeBlockProps>(), {})
</script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  flex-direction: row;
}
</style>
