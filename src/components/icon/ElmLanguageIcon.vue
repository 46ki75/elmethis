<template>
  <Icon class="icon" :style="{ '--width': `${size}px` }" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

export interface ElmLanguageIconProps {
  /**
   * The size of the icon.
   */
  size?: number

  /**
   * The language of the icon.
   */
  language: string
}

const props = withDefaults(defineProps<ElmLanguageIconProps>(), {
  size: 24
})

const render = () => {
  switch (props.language.toLowerCase()) {
    case 'rust':
    case 'rs':
      return defineAsyncComponent(() => import('./languages/Rust.vue'))

    case 'javascript':
    case 'js':
      return defineAsyncComponent(() => import('./languages/JavaScript.vue'))

    default:
      return defineAsyncComponent(
        () => import('@heroicons/vue/24/outline/CommandLineIcon')
      )
  }
}

const Icon = render()
</script>

<style scoped lang="scss">
.icon {
  height: var(--width);
}
</style>
