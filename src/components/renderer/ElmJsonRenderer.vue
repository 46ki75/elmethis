<template>
  <template v-for="component in json">
    <ElmInlineText
      v-if="component.type === 'ElmInlineText'"
      v-bind="component.props"
    />
  </template>
</template>

<script setup lang="ts">
import ElmInlineText from '../inline/ElmInlineText.vue'
import type { ElmInlineTextProps } from '../inline/ElmInlineText.vue'

type ComponentType = 'ElmInlineText'

type ComponentProps = ElmInlineTextProps

interface JsonComponent {
  type: ComponentType
  props: ComponentProps
  children?: JsonComponent[]
}

export interface ElmJsonRendererProps {
  json: JsonComponent[]
}

withDefaults(defineProps<ElmJsonRendererProps>(), {})
</script>

<style scoped lang="scss"></style>
