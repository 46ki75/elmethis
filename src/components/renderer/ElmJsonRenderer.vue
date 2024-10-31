<template>
  <template v-for="component in json">
    <ElmInlineText
      v-if="component.type === 'ElmInlineText'"
      v-bind="component.props"
    />
  </template>
</template>

<script setup lang="ts">
import ElmInlineText, { ElmInlineTextProps } from '../inline/ElmInlineText.vue'

type ComponentType = 'ElmInlineText'

type ComponentProps = ElmInlineTextProps

interface JsonComponentBase {
  type: ComponentType
  props: ComponentProps
  children?: JsonComponent[]
}

type JsonComponent = ElmInlineTextJsonComponent

interface ElmInlineTextJsonComponent extends JsonComponentBase {
  type: 'ElmInlineText'
  props: ElmInlineTextProps
}

export interface ElmJsonRendererProps {
  json: JsonComponent[]
}

withDefaults(defineProps<ElmJsonRendererProps>(), {})
</script>

<style scoped lang="scss"></style>
