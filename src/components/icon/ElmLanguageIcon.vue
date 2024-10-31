<template>
  <Icon class="icon" :style="{ '--width': `${size}px` }" />
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

    default:
      return CommandLineIcon
  }
}

const Icon = render()
</script>

<style scoped lang="scss">
.icon {
  height: var(--width);
}
</style>
