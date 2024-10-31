<template>
  <div class="wrapper">
    <div class="header">
      <div class="header__left">
        <ElmLanguageIcon :language="language" :size="20" />
        <ElmInlineText :text="caption ?? language" />
      </div>
    </div>
    <div class="code">
      <elm-prism-highlighter :code="code" :language="language" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ElmLanguageIcon from '../icon/ElmLanguageIcon.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
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

withDefaults(defineProps<ElmCodeBlockProps>(), {
  language: 'txt'
})
</script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.25rem rgba(black, 0.1);

  transition: background-color 400ms;

  background-color: rgba(white, 0.2);
  [data-theme='dark'] & {
    background-color: rgba(black, 0.2);
  }
}

.header {
  box-sizing: border-box;
  padding: 0.5rem 0.5rem 0.75rem 0.5rem;
  margin: 0.5rem;
  display: flex;
  flex-direction: row;
  font-family: 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  border-bottom: solid 1px rgba(black, 0.2);
  [data-theme='dark'] & {
    border-color: rgba(white, 0.2);
  }

  &__left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
}

.code {
  padding: 0.25rem 1rem 1rem 1rem;
}
</style>
