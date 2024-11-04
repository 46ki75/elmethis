<template>
  <h5
    :class="$style.h5"
    :id="id ?? kebabCase(text)"
    :style="{ '--font-size': size }"
  >
    {{ text }}
  </h5>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { kebabCase } from 'lodash-es'

export interface ElmHeading5Props {
  /**
   * Text to display
   */
  text: string

  /**
   * Font size of the text. Default is `'1.15rem'`.
   */
  size?: Property.FontSize

  /**
   * ID of the heading element.
   * Default is kebab-cased `text`. (using lodash)
   */
  id?: string
}

withDefaults(defineProps<ElmHeading5Props>(), {
  size: '1.15rem'
})
</script>

<style module lang="scss">
.h5 {
  margin-block: 3rem;
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
