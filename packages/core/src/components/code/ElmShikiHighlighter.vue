<template>
  <div :class="$style.code">
    <div class="shiki" v-html="html"></div>
  </div>
</template>

<script setup lang="ts">
// import { createHighlighter } from 'shiki'
import { onMounted, onServerPrefetch, ref } from 'vue'
import { getHighlighterSingleton } from './shikiInstance'

export interface ElmShikiHighlighterProps {
  /**
   * The code to display.
   */
  code: string

  /**
   * The language of the code.
   */
  language?: string
}

const props = withDefaults(defineProps<ElmShikiHighlighterProps>(), {
  language: 'txt'
})

const isRendered = ref(false)

const html = ref(`<pre>${props.code}</pre>`)

const render = async () => {
  if (!isRendered.value) {
    const highlighter = await getHighlighterSingleton()

    html.value = highlighter.codeToHtml(props.code, {
      lang: props.language,
      themes: {
        dark: 'vitesse-dark',
        light: 'vitesse-light'
      },
      colorReplacements: {
        '#ffffff': 'transparent',
        '#121212': 'transparent'
      }
    })

    isRendered.value = true
  }
}

onMounted(render)
onServerPrefetch(render)
</script>

<style module lang="scss">
.code {
  font-size: 16px;
  line-height: 24px;
}
</style>

<style lang="scss">
.shiki,
.shiki span {
  font-family: 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace !important;

  *::selection {
    background-color: rgba(black, 0.1);

    [data-theme='dark'] & {
      background-color: rgba(white, 0.15);
    }
  }

  [data-theme='dark'] & {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }
}
</style>
