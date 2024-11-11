<template>
  <component v-if="vnode != null" :is="() => vnode" />

  <ElmBlockFallback v-else />
</template>

<script setup lang="ts">
import { h, onMounted, ref, VNode, nextTick } from 'vue'
import ElmJsonRenderer, { ElmJsonRendererProps } from './ElmJsonRenderer.vue'
import ElmBlockFallback from '../fallback/ElmBlockFallback.vue'

const props = defineProps<ElmJsonRendererProps>()

const vnode = ref<VNode | null>(null)

onMounted(() => {
  nextTick(() => {
    vnode.value = h(ElmJsonRenderer, { json: props.json })
  })
})
</script>
