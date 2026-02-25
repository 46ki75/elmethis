<template>
  <p
    ref="target"
    :class="$style.paragraph"
    :style="{
      '--opacity': targetIsVisible ? 1 : 0,
      '--color': color,
      '--background-color': backgroundColor,
    }"
  >
    <slot />
  </p>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { ref } from "vue";

export interface ElmParagraphProps {
  color?: string;

  backgroundColor?: string;
}

withDefaults(defineProps<ElmParagraphProps>(), {});

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting;
});
</script>

<style module lang="scss">
.paragraph {
  margin-block: 2rem;
  opacity: var(--opacity);
  transition: opacity 800ms;
  color: var(--color);
  background-color: var(--background-color, inherit);

  &::selection {
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.7);
  }

  [data-theme="dark"] & {
    color: rgba(255, 255, 255, 0.7);

    &::selection {
      color: rgba(0, 0, 0, 0.7);
      background-color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
