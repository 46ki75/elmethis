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
  display: inline;
  height: 1em;
}
</style>
