<template>
  <h3
    ref="target"
    :class="$style.h3"
    :id="id ?? kebabCase(text)"
    :style="{ '--font-size': size, '--opacity': targetIsVisible ? 1 : 0 }"
  >
    {{ text }}
  </h3>
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

  /**
   * Whether to disable fragment identifier.
   * Default is `false`.
   */
  disableFragmentIdentifier?: boolean
}

withDefaults(defineProps<ElmHeading3Props>(), {
  size: '1.3rem',
  disableFragmentIdentifier: false
})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style module lang="scss">
.h3 {
  margin-block: 1rem;
  position: relative;
  box-sizing: border-box;
  padding-left: 0.75rem;
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
