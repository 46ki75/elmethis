<template>
  <template
    v-for="component in json"
    :key="component.type + component.props.id"
  >
    <component :is="componentMap[component.type]" v-bind="component.props">
      <template v-if="component.children" v-for="child in component.children">
        <component :is="componentMap[child.type]" v-bind="child.props" />
      </template>
    </component>
  </template>
</template>

<script setup lang="ts">
import ElmInlineText, { ElmInlineTextProps } from '../inline/ElmInlineText.vue'
import ElmInlineCode, { ElmInlineCodeProps } from '../inline/ElmInlineCode.vue'
import ElmInlineLink, { ElmInlineLinkProps } from '../inline/ElmInlineLink.vue'
import ElmCallout, { ElmCalloutProps } from '../typography/ElmCallout.vue'

type ComponentType =
  | 'ElmInlineText'
  | 'ElmInlineCode'
  | 'ElmInlineLink'
  | 'ElmCallout'

type ComponentProps =
  | ElmInlineTextProps
  | ElmInlineCodeProps
  | ElmInlineLinkProps
  | ElmCalloutProps

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

export interface ElmCalloutJsonComponent extends JsonComponentBase {
  type: 'ElmCallout'
  props: ElmCalloutProps
}

type JsonComponent =
  | ElmInlineTextJsonComponent
  | ElmInlineCodeJsonComponent
  | ElmInlineLinkJsonComponent
  | ElmCalloutJsonComponent

export interface ElmJsonRendererProps {
  json: JsonComponent[]
}

withDefaults(defineProps<ElmJsonRendererProps>(), {})

const componentMap: Record<ComponentType, any> = {
  ElmInlineText,
  ElmInlineCode,
  ElmInlineLink,
  ElmCallout
}
</script>

<style scoped lang="scss"></style>
