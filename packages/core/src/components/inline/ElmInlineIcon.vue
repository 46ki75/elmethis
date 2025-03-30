<template>
  <img :class="$style.icon" :src="src" :alt="alt" />
</template>

<script setup lang="ts">
export interface ElmInlineIconProps {
  // URL of the icon.
  src: string

  alt?: string
}

withDefaults(defineProps<ElmInlineIconProps>(), {})
</script>

<style module lang="scss">
.icon {
  margin: 0;
  padding: 0;
  padding-inline: 0.125rem;
  display: inline-block;
  vertical-align: middle;
  height: 1.5em;

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
