<template>
  <transition mode="out-in">
    <img v-if="dataUrl != null" :src="dataUrl" alt="Mermaid Chart" />
    <ElmBlockFallback v-else />
  </transition>
</template>

<script setup lang="ts">
// import { Mermaid } from 'mermaid'
import { onMounted, ref } from 'vue'
import ElmBlockFallback from '../fallback/ElmBlockFallback.vue'

export interface ElmMermaidProps {
  code: string
}

const props = withDefaults(defineProps<ElmMermaidProps>(), {})

const dataUrl = ref<string | null>(null)

onMounted(async () => {
  if (window?.document != null) {
    const mermaidModule = await import('mermaid')
    const mermaid = mermaidModule.default ?? mermaidModule

    mermaid.initialize({ startOnLoad: true })
    const { svg } = await mermaid.render('mermaid-svg', props.code)

    const base64 = btoa(
      encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    )

    dataUrl.value = `data:image/svg+xml;base64,${base64}`
  }
})
</script>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 250ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<style module lang="scss"></style>
