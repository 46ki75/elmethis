<template>
  <component
    :class="$style.katex"
    :key="JSON.stringify(props)"
    ref="targetRef"
    :style="{
      '--margin-block': props.block ? '3rem' : undefined
    }"
    :is="props.block ? 'div' : 'span'"
    >{{ expression }}</component
  >
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'

import katex from 'katex'
import 'katex/dist/katex.min.css'

export interface ElmKatexProps {
  /**
   * The KaTex expression.
   */
  expression: string

  /**
   * Whether to render the equation in block mode.
   * - If `true`, the equation will be rendered in block mode.
   * - If `false`, the equation will be rendered in inline mode.
   *
   * Default is `false`.
   */
  block?: boolean
}

const props = withDefaults(defineProps<ElmKatexProps>(), {
  block: false
})

const targetRef = ref<HTMLElement | null>(null)

const render = () => {
  if (targetRef.value) {
    try {
      katex.render(props.expression, targetRef.value, {
        displayMode: props.block
      })
    } catch (err) {
      console.error('KaTeX rendering error:', err)
    }
  }
}

onMounted(render)
onUpdated(render)
</script>

<style module lang="scss">
.katex {
  margin-block: var(--margin-block);
  color: rgba(0, 0, 0, 0.7);

  &::selection {
    color: rgba(255, 255, 255, 0.7);
    background-color: var(--color, rgba(0, 0, 0, 0.7));
  }

  [data-theme='dark'] & {
    color: var(--color, rgba(255, 255, 255, 0.7));

    &::selection {
      color: rgba(0, 0, 0, 0.7);
      background-color: var(--color, rgba(255, 255, 255, 0.7));
    }
  }
}
</style>
