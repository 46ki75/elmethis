<template>
  <div
    ref="target"
    :class="$style.wrapper"
    :style="{
      '--margin-block': margin,
      '--opacity': targetIsVisible ? 1 : 0
    }"
  >
    <div :class="$style.header">
      <div :class="$style.header__left">
        <ElmLanguageIcon :language="language" :size="20" />
        <ElmInlineText :text="caption ?? language" />
      </div>

      <ElmTooltip>
        <template #original>
          <Icon
            :class="$style['copy-icon']"
            @click="
              () => {
                copy(code)
              }
            "
            :icon="
              copied
                ? 'mdi:clipboard-check-multiple-outline'
                : 'mdi:clipboard-multiple-outline'
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
    <div :class="$style.code">
      <ElmShikiHighlighter :code="code" :language="language" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmLanguageIcon from '../icon/ElmLanguageIcon.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import ElmShikiHighlighter from './ElmShikiHighlighter.vue'
import { useClipboard, useIntersectionObserver } from '@vueuse/core'
import ElmTooltip from '../containments/ElmTooltip.vue'
import type { Property } from 'csstype'
import { ref } from 'vue'

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

  /**
   * The margin of the code block.
   */
  margin?: Property.MarginBlock
}

const props = withDefaults(defineProps<ElmCodeBlockProps>(), {
  language: 'txt'
})

const { copy, copied } = useClipboard({ source: props.code })

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style module lang="scss">
.wrapper {
  margin-block: var(--margin-block);
  opacity: var(--opacity);
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;

  transition:
    background-color 400ms,
    opacity 800ms;

  background-color: rgba(white, 0.4);
  box-shadow: 0 0 0.25rem rgba(black, 0.1);
  [data-theme='dark'] & {
    background-color: rgba(white, 0.05);
    box-shadow: 0 0 0.25rem rgba(black, 0.3);
  }
}

.header {
  box-sizing: border-box;
  padding: 0.25rem 0.5rem 0.5rem 0.5rem;
  margin: 0.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-family: 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  border-bottom: solid 1px rgba(black, 0.2);
  [data-theme='dark'] & {
    border-color: rgba(white, 0.2);
  }
}

.header__left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.copy-icon {
  box-sizing: border-box;
  padding: 0.125rem;
  width: 26px;
  height: 26px;
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
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(#6987b8, 0.3) rgba(#6987b8, 0.15);
}
</style>
