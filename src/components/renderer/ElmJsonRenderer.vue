<template>
  <template
    v-for="component in json"
    :key="component.type + (component.props?.id || '')"
  >
    <component :is="componentMap[component.type]" v-bind="component.props">
      <template v-if="component.children">
        <ElmJsonRenderer :json="component.children" />
      </template>
    </component>
  </template>
</template>

<script setup lang="ts">
import ElmInlineText, { ElmInlineTextProps } from '../inline/ElmInlineText.vue'
import ElmInlineCode, { ElmInlineCodeProps } from '../inline/ElmInlineCode.vue'
import ElmInlineLink, { ElmInlineLinkProps } from '../inline/ElmInlineLink.vue'
import ElmCallout, { ElmCalloutProps } from '../typography/ElmCallout.vue'
import ElmBulletedList, {
  ElmBulletedListProps
} from '../typography/ElmBulletedList.vue'
import ElmNumberedList, {
  ElmNumberedListProps
} from '../typography/ElmNumberedList.vue'
import ElmListItem, { ElmListItemProps } from '../typography/ElmListItem.vue'
import ElmBlockQuote, {
  ElmBlockQuoteProps
} from '../typography/ElmBlockQuote.vue'
import ElmDivider, { ElmDividerProps } from '../typography/ElmDivider.vue'

type ComponentType =
  | 'ElmInlineText'
  | 'ElmInlineCode'
  | 'ElmInlineLink'
  | 'ElmCallout'
  | 'ElmBulletedList'
  | 'ElmNumberedList'
  | 'ElmListItem'
  | 'ElmBlockQuote'
  | 'ElmDivider'

type ComponentProps =
  | ElmInlineTextProps
  | ElmInlineCodeProps
  | ElmInlineLinkProps
  | ElmCalloutProps
  | ElmBulletedListProps
  | ElmNumberedListProps
  | ElmListItemProps
  | ElmBlockQuoteProps
  | ElmDividerProps

interface JsonComponentBase {
  type: ComponentType
  props?: ComponentProps
  children?: JsonComponent[]
}

interface ElmInlineTextJsonComponent extends JsonComponentBase {
  type: 'ElmInlineText'
  props?: ElmInlineTextProps
}

interface ElmInlineCodeJsonComponent extends JsonComponentBase {
  type: 'ElmInlineCode'
  props?: ElmInlineCodeProps
}

interface ElmInlineLinkJsonComponent extends JsonComponentBase {
  type: 'ElmInlineLink'
  props?: ElmInlineLinkProps
}

interface ElmCalloutJsonComponent extends JsonComponentBase {
  type: 'ElmCallout'
  props?: ElmCalloutProps
}

interface ElmBulletedListJsonComponent extends JsonComponentBase {
  type: 'ElmBulletedList'
  props?: ElmBulletedListProps
}

interface ElmNumberedListJsonComponent extends JsonComponentBase {
  type: 'ElmNumberedList'
  props?: ElmNumberedListProps
}

interface ElmListItemJsonComponent extends JsonComponentBase {
  type: 'ElmListItem'
  props?: ElmListItemProps
}

interface ElmBlockQuoteJsonComponent extends JsonComponentBase {
  type: 'ElmBlockQuote'
  props?: ElmBlockQuoteProps
}

interface ElmDividerJsonComponent extends JsonComponentBase {
  type: 'ElmDivider'
  props?: ElmDividerProps
}

type JsonComponent =
  | ElmInlineTextJsonComponent
  | ElmInlineCodeJsonComponent
  | ElmInlineLinkJsonComponent
  | ElmCalloutJsonComponent
  | ElmBulletedListJsonComponent
  | ElmNumberedListJsonComponent
  | ElmListItemJsonComponent
  | ElmBlockQuoteJsonComponent
  | ElmDividerJsonComponent

export interface ElmJsonRendererProps {
  json: JsonComponent[]
}

withDefaults(defineProps<ElmJsonRendererProps>(), {})

const componentMap: Record<ComponentType, any> = {
  ElmInlineText,
  ElmInlineCode,
  ElmInlineLink,
  ElmCallout,
  ElmBulletedList,
  ElmNumberedList,
  ElmListItem,
  ElmBlockQuote,
  ElmDivider
}
</script>

<style scoped lang="scss"></style>
