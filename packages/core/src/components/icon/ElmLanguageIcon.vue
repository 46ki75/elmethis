<template>
  <div :class="$style.block" :style="{ '--size': `${size}px` }">
    <transition mode="out-in">
      <Icon :class="$style.icon" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

import { CommandLineIcon } from '@heroicons/vue/24/outline'
import { watch } from 'vue'

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

    case 'tf':
    case 'terraform':
    case 'hcl':
      return defineAsyncComponent({
        loader: () => import('./languages/Terraform.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'html':
      return defineAsyncComponent({
        loader: () => import('./languages/Html.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'css':
      return defineAsyncComponent({
        loader: () => import('./languages/Css.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'npm':
      return defineAsyncComponent({
        loader: () => import('./languages/Npm.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'java':
      return defineAsyncComponent({
        loader: () => import('./languages/Java.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'go':
    case 'golang':
      return defineAsyncComponent({
        loader: () => import('./languages/Go.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'python':
    case 'py':
      return defineAsyncComponent({
        loader: () => import('./languages/Python.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'sql':
      return defineAsyncComponent({
        loader: () => import('./languages/Sql.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'json':
      return defineAsyncComponent({
        loader: () => import('./languages/Json.vue'),
        loadingComponent: CommandLineIcon
      })

    case 'lua':
      return defineAsyncComponent({
        loader: () => import('./languages/Lua.vue'),
        loadingComponent: CommandLineIcon
      })

    default:
      return CommandLineIcon
  }
}

const Icon = ref(render())

watch(
  () => props.language,
  () => {
    Icon.value = render()
  }
)
</script>

<style module lang="scss">
.block {
  display: inline-block;
  height: var(--size);
  width: var(--size);
}

.icon {
  height: var(--size);
  width: var(--size);
}
</style>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 100ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
