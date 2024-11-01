<template>
  <blockquote
    ref="target"
    class="blockquote"
    :style="{
      '--opacity': targetIsVisible ? 1 : 0
    }"
  >
    <slot />
  </blockquote>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ref } from 'vue'

export interface ElmBlockQuoteProps {}

withDefaults(defineProps<ElmBlockQuoteProps>(), {})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style scoped lang="scss">
.blockquote {
  opacity: var(--opacity);
  transition: opacity 800ms;
  box-sizing: border-box;
  margin: 0;
  padding: 0.125rem 1.5rem;
  border-left: 4px solid rgba(black, 0.2);

  [data-theme='dark'] & {
    border-left-color: rgba(white, 0.2);
  }
}
</style>
