<template>
  <h3
    :class="$style.h3"
    :id="id ?? kebabCase(text)"
    :style="{ '--font-size': size }"
  >
    {{ text }}
  </h3>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { kebabCase } from 'lodash-es'

export interface ElmHeading3Props {
  /**
   * Text to display
   */
  text: string

  /**
   * Font size of the text. Default is `'1.3rem'`.
   */
  size?: Property.FontSize

  /**
   * ID of the heading element.
   * Default is kebab-cased `text`. (using lodash)
   */
  id?: string
}

withDefaults(defineProps<ElmHeading3Props>(), {
  size: '1.3rem'
})
</script>

<style module lang="scss">
.h3 {
  margin-block: 3rem;
  position: relative;
  box-sizing: border-box;
  padding-left: 0.75rem;
  font-size: var(--font-size);
  line-height: var(--font-size);
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

  &::after {
    position: absolute;
    content: '';
    width: 3px;
    height: 50%;
    top: 25%;
    left: 0;

    background-color: rgba(0, 0, 0, 0.8);
    [data-theme='dark'] & {
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
