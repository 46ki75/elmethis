<template>
  <nav :class="$style.toc">
    <a
      :class="$style.link"
      v-for="heading in headings"
      :href="`#${heading.id ?? heading.text}`"
      :style="{ '--padding-left': `${heading.level * 0.5}rem` }"
    >
      <sup>
        <ElmInlineText
          :text="`H${heading.level}`"
          size="0.6rem"
          color="#6987b8"
        />
      </sup>
      <ElmInlineText :text="heading.text" />
      <Icon icon="heroicons:bars-arrow-down" :class="$style.icon" />
    </a>
  </nav>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

export interface ElmTableOfContentsProps {
  headings: Array<{
    level: 1 | 2 | 3 | 4 | 5 | 6
    text: string
    id?: string
  }>
}

withDefaults(defineProps<ElmTableOfContentsProps>(), {})
</script>

<style module lang="scss">
.toc {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-left: 0.5rem;
  border-left-style: solid;
  border-left-width: 0.25rem;
  border-left-color: rgba(black, 0.1);
  [data-theme='dark'] & {
    border-left-color: rgba(white, 0.15);
  }

  .link {
    all: unset;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    gap: 0.5rem;
    border-radius: 0.25rem;
    padding: 0.25rem;
    padding-left: var(--padding-left, 0.25rem);
    transition: background-color 200ms;
    cursor: pointer;

    &:hover {
      background-color: rgba(#6987b8, 0.2);
    }

    .icon {
      width: 12px;
      height: 12px;
      color: #6987b8;
    }
  }
}
</style>
