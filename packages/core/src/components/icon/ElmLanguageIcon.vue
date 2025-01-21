<template>
  <div :class="$style.block" :style="{ '--size': `${size}px` }">
    <transition mode="out-in">
      <Icon :class="$style.icon" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, h, ref, useCssModule } from 'vue'
import { Icon as Iconify } from '@iconify/vue'
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

const style = useCssModule()
const Fallback = h(Iconify, { icon: 'mdi:terminal-line', class: style.icon })

const render = () => {
  switch (props.language.toLowerCase()) {
    case 'rust':
    case 'rs':
      return defineAsyncComponent({
        loader: () => import('./languages/Rust.vue'),
        loadingComponent: Fallback
      })

    case 'javascript':
    case 'js':
      return defineAsyncComponent({
        loader: () => import('./languages/JavaScript.vue'),
        loadingComponent: Fallback
      })

    case 'typescript':
    case 'ts':
      return defineAsyncComponent({
        loader: () => import('./languages/TypeScript.vue'),
        loadingComponent: Fallback
      })

    case 'bash':
    case 'sh':
    case 'shell':
      return defineAsyncComponent({
        loader: () => import('./languages/Bash.vue'),
        loadingComponent: Fallback
      })

    case 'tf':
    case 'terraform':
    case 'hcl':
      return defineAsyncComponent({
        loader: () => import('./languages/Terraform.vue'),
        loadingComponent: Fallback
      })

    case 'html':
      return defineAsyncComponent({
        loader: () => import('./languages/Html.vue'),
        loadingComponent: Fallback
      })

    case 'css':
      return defineAsyncComponent({
        loader: () => import('./languages/Css.vue'),
        loadingComponent: Fallback
      })

    case 'npm':
      return defineAsyncComponent({
        loader: () => import('./languages/Npm.vue'),
        loadingComponent: Fallback
      })

    case 'java':
      return defineAsyncComponent({
        loader: () => import('./languages/Java.vue'),
        loadingComponent: Fallback
      })

    case 'kotlin':
    case 'kt':
      return defineAsyncComponent({
        loader: () => import('./languages/Kotlin.vue'),
        loadingComponent: Fallback
      })

    case 'go':
    case 'golang':
      return defineAsyncComponent({
        loader: () => import('./languages/Go.vue'),
        loadingComponent: Fallback
      })

    case 'python':
    case 'py':
      return defineAsyncComponent({
        loader: () => import('./languages/Python.vue'),
        loadingComponent: Fallback
      })

    case 'sql':
      return defineAsyncComponent({
        loader: () => import('./languages/Sql.vue'),
        loadingComponent: Fallback
      })

    case 'json':
      return defineAsyncComponent({
        loader: () => import('./languages/Json.vue'),
        loadingComponent: Fallback
      })

    case 'lua':
      return defineAsyncComponent({
        loader: () => import('./languages/Lua.vue'),
        loadingComponent: Fallback
      })

    case 'cs':
    case 'csharp':
      return defineAsyncComponent({
        loader: () => import('./languages/Csharp.vue'),
        loadingComponent: Fallback
      })

    case 'cpp':
    case 'c++':
      return defineAsyncComponent({
        loader: () => import('./languages/Cpp.vue'),
        loadingComponent: Fallback
      })

    case 'c':
      return defineAsyncComponent({
        loader: () => import('./languages/C.vue'),
        loadingComponent: Fallback
      })

    default:
      return Fallback
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
