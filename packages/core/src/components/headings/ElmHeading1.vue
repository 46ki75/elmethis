<template>
  <h1
    ref="target"
    :class="$style.h1"
    :id="id ?? kebabCase(text)"
    :style="{
      '--scale': targetIsVisible ? 1 : 0,
      '--font-size': size,
      '--opacity': targetIsVisible ? 1 : 0
    }"
  >
    {{ text }}
  </h1>
  <ElmFragmentIdentifier :id="id ?? kebabCase(text)" />
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { kebabCase } from 'lodash-es'
import ElmFragmentIdentifier from './ElmFragmentIdentifier.vue'

export interface ElmHeading1Props {
  /**
   * Text to display
   */
  text: string

  /**
   * Font size of the text. Default is `'1.5rem'`.
   */
  size?: Property.FontSize

  /**
   * ID of the heading element.
   * Default is kebab-cased `text`. (using lodash)
   */
  id?: string
}

withDefaults(defineProps<ElmHeading1Props>(), {
  size: '1.5rem'
})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style module lang="scss">
.h1 {
  position: relative;
  font-size: var(--font-size);
  line-height: var(cacl(--font-size + 0.25rem));
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
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 0.25px;
    background-color: rgba(0, 0, 0, 0.5);

    transition: transform 800ms;
    transform: scaleX(var(--scale));

    [data-theme='dark'] & {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }

  &::before {
    position: absolute;
    content: '';
    bottom: -4px;
    left: 45%;
    width: 10%;
    height: 2px;
    background-color: rgba(0, 0, 0, 0.6);

    transition: transform 800ms;
    transform: scaleY(var(--scale));
    transform-origin: top;

    [data-theme='dark'] & {
      background-color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
