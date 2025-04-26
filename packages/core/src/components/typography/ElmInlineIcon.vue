<template>
  <img :class="$style.icon" :src="icon" :alt="alt" @error="handleError" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface ElmInlineIconProps {
  /**
   * The source URL of the icon.
   */
  src: string

  /**
   * The alt text for the icon.
   */
  alt?: string
}

const props = withDefaults(defineProps<ElmInlineIconProps>(), {})

const icon = ref(props.src)

const handleError = () => {
  icon.value = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="gray" d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"/></svg>`
}
</script>

<style module lang="scss">
.icon {
  margin: 0;
  padding: 0;
  padding-inline: 0.125rem;
  display: inline-block;
  vertical-align: middle;
  height: 1em;

  &::selection {
    filter: brightness(1000%);
    background-color: var(--color, rgba(black, 0.25));
  }

  [data-theme='dark'] & {
    color: var(--color, rgba(white, 0.7));

    &::selection {
      color: rgba(black, 0.7);
      background-color: var(--color, rgba(white, 0.25));
    }
  }
}
</style>
