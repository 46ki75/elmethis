<template>
  <component
    :class="$style.katex"
    :key="JSON.stringify(props)"
    ref="targetRef"
    :style="{
      '--margin-block': props.block ? '3rem' : undefined
    }"
    :is="props.block ? 'div' : 'span'"
  >
    <span v-if="isRendered" v-html="html"></span>
    <span v-else>{{ expression }}</span>
  </component>
</template>

<script setup lang="ts">
import { onMounted, onServerPrefetch, onUpdated, ref } from 'vue'

import { renderToString } from 'katex'
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

const isRendered = ref(false)

const html = ref<string>(props.expression)

const render = () => {
  if (!isRendered.value) {
    try {
      html.value = renderToString(props.expression, {
        displayMode: props.block
      })
      isRendered.value = true
    } catch (err) {
      console.error('KaTeX rendering error:', err)
    }
  }
}

onServerPrefetch(render)
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
