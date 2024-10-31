<template>
  <div class="wrapper">
    <div class="header">
      <div class="header__left">
        <ElmLanguageIcon :language="language" :size="20" />
        <ElmInlineText :text="caption ?? language" />
      </div>

      <ElmTooltip>
        <template #original>
          <ClipboardDocumentIcon
            class="copy-icon"
            @click="
              () => {
                copy(code)
              }
            "
          />
        </template>
        <template #tooltip>
          <div>
            <ElmInlineText
              :text="copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'"
            />
          </div>
        </template>
      </ElmTooltip>
    </div>
    <div class="code">
      <elm-prism-highlighter :code="code" :language="language" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import ElmLanguageIcon from '../icon/ElmLanguageIcon.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmPrismHighlighter from './ElmPrismHighlighter.vue'
import { useClipboard } from '@vueuse/core'
import ElmTooltip from '../containments/ElmTooltip.vue'

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

const props = withDefaults(defineProps<ElmCodeBlockProps>(), {
  language: 'txt'
})

const { copy, copied } = useClipboard({ source: props.code })
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
  justify-content: space-between;
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

.copy-icon {
  box-sizing: border-box;
  padding: 0.125rem;
  width: 24px;
  border-radius: 0.125rem;
  cursor: pointer;

  transition: background-color 200ms;

  color: rgba(black, 0.7);

  [data-theme='dark'] & {
    color: rgba(white, 0.7);
  }

  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme='dark'] & {
      background-color: rgba(white, 0.1);
    }
  }
}

.code {
  padding: 0.25rem 1rem 1rem 1rem;
}
</style>
