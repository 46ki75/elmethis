<template>
  <span :key="JSON.stringify(props)" ref="targetRef">{{ equation }}</span>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'

import katex from 'katex'
import 'katex/dist/katex.min.css'

export interface ElmKatexProps {
  /**
   * The KaTex expression.
   */
  equation: string

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
      katex.render(props.equation, targetRef.value, {
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

<style scoped lang="scss"></style>
