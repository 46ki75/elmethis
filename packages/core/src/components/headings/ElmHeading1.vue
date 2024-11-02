<template>
  <h1
    ref="target"
    class="h1"
    :id="id ?? kebabCase(text)"
    :style="{ '--scale': targetIsVisible ? 1 : 0, '--font-size': size }"
  >
    {{ text }}
  </h1>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { kebabCase } from 'lodash-es'

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

<style scoped lang="scss">
.h1 {
  margin-block: 3rem;
  position: relative;
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
