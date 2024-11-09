<template>
  <h6
    :class="$style.h6"
    :id="id ?? kebabCase(text)"
    :style="{ '--font-size': size }"
  >
    {{ text }}
  </h6>
  <ElmFragmentIdentifier :id="id ?? kebabCase(text)" />
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { kebabCase } from 'lodash-es'
import ElmFragmentIdentifier from './ElmFragmentIdentifier.vue'

export interface ElmHeading6Props {
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
}

withDefaults(defineProps<ElmHeading6Props>(), {
  size: '1.1rem'
})
</script>

<style module lang="scss">
.h6 {
  margin-block: 0.5rem;
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
