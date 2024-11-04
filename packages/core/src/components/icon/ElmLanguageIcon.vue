<template>
  <Icon :class="$style.icon" :style="{ '--width': `${size}px` }" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import { CommandLineIcon } from '@heroicons/vue/24/outline'

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
      return defineAsyncComponent({
        loader: () => import('./languages/Rust.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'javascript':
    case 'js':
      return defineAsyncComponent({
        loader: () => import('./languages/JavaScript.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'typescript':
    case 'ts':
      return defineAsyncComponent({
        loader: () => import('./languages/TypeScript.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'bash':
    case 'sh':
    case 'shell':
      return defineAsyncComponent({
        loader: () => import('./languages/Bash.vue'),
        loadingComponent: CommandLineIcon
      })

    default:
      return CommandLineIcon
  }
}

const Icon = render()
</script>

<style module lang="scss">
.icon {
  height: var(--width);
}
</style>
