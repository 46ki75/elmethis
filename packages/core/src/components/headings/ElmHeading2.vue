<template>
  <h2
    ref="target"
    :class="$style.h2"
    :id="id ?? kebabCase(text)"
    :style="{
      '--scale': targetIsVisible ? 1 : 0,
      '--font-size': size,
      '--opacity': targetIsVisible ? 1 : 0
    }"
  >
    {{ text }}<span :class="$style.underline" aria-hidden></span>
  </h2>
  <ElmFragmentIdentifier
    v-if="!disableFragmentIdentifier"
    :id="id ?? kebabCase(text)"
  />
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import type { Property } from 'csstype'
import { kebabCase } from 'lodash-es'
import { ref } from 'vue'
import ElmFragmentIdentifier from './ElmFragmentIdentifier.vue'

export interface ElmHeading2Props {
  /**
   * Text to display
   */
  text: string

  /**
   * Font size of the text. Default is `'1.4rem'`.
   */
  size?: Property.FontSize

  /**
   * ID of the heading element.
   * Default is kebab-cased `text`. (using lodash)
   */
  id?: string

  /**
   * Whether to disable fragment identifier.
   * Default is `false`.
   */
  disableFragmentIdentifier?: boolean
}

withDefaults(defineProps<ElmHeading2Props>(), {
  size: '1.4rem',
  disableFragmentIdentifier: false
})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style module lang="scss">
.h2 {
  margin-block: 1rem;
  position: relative;
  font-size: var(--font-size);
  line-height: var(--font-size);
  opacity: var(--opacity);

  transition:
    color 400ms,
    opacity 800ms;

  color: rgba(black, 0.8);
  &::selection {
    color: rgba(white, 0.8);
    background-color: rgba(black, 0.8);
  }

  [data-theme='dark'] & {
    color: rgba(white, 0.8);

    &::selection {
      color: rgba(black, 0.8);
      background-color: rgba(white, 0.8);
    }
  }

  &::after {
    position: absolute;
    content: '';
    right: 2px;
    bottom: -4px;
    width: 6px;
    height: 8px;
    opacity: 0.8;
    transform: skewX(-25deg);

    background-color: rgba(0, 0, 0, 0.8);
    [data-theme='dark'] & {
      background-color: rgba(255, 255, 255, 0.8);
    }
  }

  &::before {
    position: absolute;
    content: '';
    right: 10px;
    bottom: -4px;
    width: 6px;
    height: 8px;
    opacity: 0.8;
    transform: skewX(-25deg);

    background-color: rgba(0, 0, 0, 0.8);
    [data-theme='dark'] & {
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
}

.underline {
  overflow: hidden;
  position: absolute;
  content: '';
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 0.25px;
  background-color: rgba(0, 0, 0, 0.5);

  transition: transform 800ms;
  transform: scaleX(var(--scale));
  transform-origin: left;

  [data-theme='dark'] & {
    background-color: rgba(255, 255, 255, 0.5);
  }
}
</style>
