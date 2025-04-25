<template>
  <component
    :is="`h${level}`"
    ref="target"
    :class="[$style[`h${level}`], $style['heading-common']]"
    :id="id ?? kebabCase(text)"
    :style="{
      '--font-size': size ?? `${SIZE_MAP[level]}rem`,
      '--scale': targetIsVisible ? 1 : 0,
      '--opacity': targetIsVisible ? 1 : 0
    }"
  >
    <component :is="() => renderSlots()" />

    <span
      v-if="level === 2"
      :class="$style['h2__underline']"
      aria-hidden
    ></span>
  </component>

  <ElmFragmentIdentifier
    v-if="!disableFragmentIdentifier"
    :id="id ?? kebabCase(text)"
  />
</template>

<script setup lang="ts">
import type { Property } from 'csstype'
import { h, ref, useSlots, VNode } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { kebabCase } from 'lodash-es'
import ElmFragmentIdentifier from './ElmFragmentIdentifier.vue'

const SIZE_MAP: Record<1 | 2 | 3 | 4 | 5 | 6, number> = Object.freeze({
  1: 1.5,
  2: 1.4,
  3: 1.3,
  4: 1.2,
  5: 1.15,
  6: 1.1
})

export interface ElmHeadingProps {
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

  /**
   * Whether to disable fragment identifier.
   * Default is `false`.
   */
  disableFragmentIdentifier?: boolean

  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<ElmHeadingProps>(), {
  disableFragmentIdentifier: false,
  level: 1
})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})

const slots = useSlots()

const renderSlots = (): VNode => {
  if (slots.default != null) {
    return h('span', {}, slots.default())
  } else {
    return h('span', {}, props.text)
  }
}
</script>

<style module lang="scss">
.heading-common {
  position: relative;
  font-size: var(--font-size);
  line-height: var(--font-size);
  opacity: var(--opacity);

  transition:
    color 400ms,
    opacity 800ms;
}

.h1 {
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
    bottom: -6px;
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
    bottom: -8px;
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

.h2 {
  margin-block: 1rem;

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

  &__underline {
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
}

.h3 {
  margin-block: 1rem;
  box-sizing: border-box;
  padding-left: 0.75rem;

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

.h4 {
  margin-block: 0.5rem;

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

.h5 {
  margin-block: 0.5rem;

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

.h6 {
  margin-block: 0.5rem;

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
