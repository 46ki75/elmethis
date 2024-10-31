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
import ElmHeading1, { ElmHeading1Props } from '../headings/ElmHeading1.vue'
import ElmHeading2, { ElmHeading2Props } from '../headings/ElmHeading2.vue'
import ElmHeading3, { ElmHeading3Props } from '../headings/ElmHeading3.vue'
import ElmHeading4, { ElmHeading4Props } from '../headings/ElmHeading4.vue'
import ElmHeading5, { ElmHeading5Props } from '../headings/ElmHeading5.vue'
import ElmHeading6, { ElmHeading6Props } from '../headings/ElmHeading6.vue'

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
  | 'ElmHeading1'
  | 'ElmHeading2'
  | 'ElmHeading3'
  | 'ElmHeading4'
  | 'ElmHeading5'
  | 'ElmHeading6'

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
  | ElmHeading1Props
  | ElmHeading2Props
  | ElmHeading3Props
  | ElmHeading4Props
  | ElmHeading5Props
  | ElmHeading6Props

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

interface ElmHeading1JsonComponent extends JsonComponentBase {
  type: 'ElmHeading1'
  props?: ElmHeading1Props
}

interface ElmHeading2JsonComponent extends JsonComponentBase {
  type: 'ElmHeading2'
  props?: ElmHeading2Props
}

interface ElmHeading3JsonComponent extends JsonComponentBase {
  type: 'ElmHeading3'
  props?: ElmHeading3Props
}

interface ElmHeading4JsonComponent extends JsonComponentBase {
  type: 'ElmHeading4'
  props?: ElmHeading4Props
}

interface ElmHeading5JsonComponent extends JsonComponentBase {
  type: 'ElmHeading5'
  props?: ElmHeading5Props
}

interface ElmHeading6JsonComponent extends JsonComponentBase {
  type: 'ElmHeading6'
  props?: ElmHeading6Props
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
  | ElmHeading1JsonComponent
  | ElmHeading2JsonComponent
  | ElmHeading3JsonComponent
  | ElmHeading4JsonComponent
  | ElmHeading5JsonComponent
  | ElmHeading6JsonComponent

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
  ElmDivider,
  ElmHeading1,
  ElmHeading2,
  ElmHeading3,
  ElmHeading4,
  ElmHeading5,
  ElmHeading6
}
</script>

<style scoped lang="scss"></style>
