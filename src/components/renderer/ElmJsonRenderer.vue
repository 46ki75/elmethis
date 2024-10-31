<template>
  <template
    v-for="component in json"
    :key="component.type + component.props.id"
  >
    <component :is="componentMap[component.type]" v-bind="component.props" />
  </template>
</template>

<script setup lang="ts">
import ElmInlineText, { ElmInlineTextProps } from '../inline/ElmInlineText.vue'
import ElmInlineCode, { ElmInlineCodeProps } from '../inline/ElmInlineCode.vue'
import ElmInlineLink, { ElmInlineLinkProps } from '../inline/ElmInlineLink.vue'

type ComponentType = 'ElmInlineText' | 'ElmInlineCode' | 'ElmInlineLink'

type ComponentProps =
  | ElmInlineTextProps
  | ElmInlineCodeProps
  | ElmInlineLinkProps

interface JsonComponentBase {
  type: ComponentType
  props: ComponentProps
  children?: JsonComponent[]
}

interface ElmInlineTextJsonComponent extends JsonComponentBase {
  type: 'ElmInlineText'
  props: ElmInlineTextProps
}

interface ElmInlineCodeJsonComponent extends JsonComponentBase {
  type: 'ElmInlineCode'
  props: ElmInlineCodeProps
}

interface ElmInlineLinkJsonComponent extends JsonComponentBase {
  type: 'ElmInlineLink'
  props: ElmInlineLinkProps
}

type JsonComponent =
  | ElmInlineTextJsonComponent
  | ElmInlineCodeJsonComponent
  | ElmInlineLinkJsonComponent

export interface ElmJsonRendererProps {
  json: JsonComponent[]
}

withDefaults(defineProps<ElmJsonRendererProps>(), {})

const componentMap: Record<ComponentType, any> = {
  ElmInlineText,
  ElmInlineCode,
  ElmInlineLink
}
</script>

<style scoped lang="scss"></style>
