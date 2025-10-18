<template>
  <blockquote
    ref="target"
    :class="$style.blockquote"
    :style="{
      '--opacity': targetIsVisible ? 1 : 0,
    }"
    :cite="cite"
  >
    <slot />

    <cite v-if="cite" :class="$style.cite">
      <a :href="cite" target="_blank" rel="noopener noreferrer">{{ cite }}</a>
    </cite>

    <svg
      :class="$style.icon"
      style="top: 0.25rem; left: 0.25rem"
      viewBox="0 0 24 24"
      width="1rem"
      height="1rem"
    >
      <path :d="mdiFormatQuoteOpen" />
    </svg>

    <svg
      :class="$style.icon"
      style="bottom: 0.25rem; right: 0.25rem"
      viewBox="0 0 24 24"
      width="1rem"
      height="1rem"
    >
      <path :d="mdiFormatQuoteClose" />
    </svg>
  </blockquote>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { ref } from "vue";
import { mdiFormatQuoteOpen, mdiFormatQuoteClose } from "@mdi/js";

export interface ElmBlockQuoteProps {
  cite?: string;
}

withDefaults(defineProps<ElmBlockQuoteProps>(), {});

const target = ref(null);
const targetIsVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }], _) => {
  targetIsVisible.value = isIntersecting;
});
</script>

<style module lang="scss">
.blockquote {
  position: relative;
  margin-block: 2rem;
  opacity: var(--opacity);
  transition: opacity 800ms;
  box-sizing: border-box;
  margin: 0;
  padding: 1.5rem 0.5rem 1.5rem 1.5rem;
  background-color: rgba(#868e9c, 0.05);

  border-left: 4px solid rgba(black, 0.2);

  [data-theme="dark"] & {
    border-left-color: rgba(#bec2ca, 0.2);
  }
}

.cite {
  position: absolute;
  font-size: 0.75rem;
  line-height: 0.75rem;
  bottom: 0.5rem;
  right: 2rem;

  a {
    all: unset;
    color: #6987b8;
    padding: 0 0.25rem;
    border-radius: 0.125rem;
    cursor: pointer;
    transition: background-color 100ms;

    &:hover {
      background-color: rgba(#6987b8, 0.15);
    }
  }
}

.icon {
  position: absolute;
  padding: 0;
  margin: 0;
  width: 1rem;
  height: 1rem;
  fill: #868e9c;
}
</style>
