<template>
  <ol
    ref="target"
    class="elmethis-numbered-list"
    :style="{
      '--opacity': targetIsVisible ? 1 : 0
    }"
  >
    <slot />
  </ol>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ref } from 'vue'

export interface ElmNumberedListProps {}

withDefaults(defineProps<ElmNumberedListProps>(), {})

const target = ref(null)
const targetIsVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting
})
</script>

<style lang="scss">
.elmethis-numbered-list {
  opacity: var(--opacity);
  transition: opacity 800ms;
  box-sizing: border-box;
  padding-left: 1.25rem;

  li {
    box-sizing: border-box;
    padding-left: 0.25rem;
    margin-block: 0.75rem;
    margin-left: 0.25rem;

    list-style-type: decimal;
    &::marker {
      color: #9771bd;
    }

    ol {
      li {
        list-style-type: lower-alpha;
        ol {
          li {
            list-style-type: lower-roman;
            ol {
              li {
                list-style-type: lower-greek;
              }
            }
          }
        }
      }
    }
  }
}
</style>
