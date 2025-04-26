<template>
  <component :is="() => render(json)" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import type { ElmInlineTextProps } from '../inline/ElmInlineText.vue'
import type { ElmInlineIconProps } from '../inline/ElmInlineIcon.vue'
import type { ElmCalloutProps } from '../typography/ElmCallout.vue'
import type { ElmBulletedListProps } from '../typography/ElmBulletedList.vue'
import type { ElmNumberedListProps } from '../typography/ElmNumberedList.vue'
import type { ElmListItemProps } from '../typography/ElmListItem.vue'
import type { ElmBlockQuoteProps } from '../typography/ElmBlockQuote.vue'
import type { ElmDividerProps } from '../typography/ElmDivider.vue'
import type { ElmHeadingProps } from '../typography/ElmHeading.vue'
import type { ElmCodeBlockProps } from '../code/ElmCodeBlock.vue'
import type { ElmParagraphProps } from '../typography/ElmParagraph.vue'
import type { ElmTableProps } from '../table/ElmTable.vue'
import type { ElmTableHeaderProps } from '../table/ElmTableHeader.vue'
import type { ElmTableBodyProps } from '../table/ElmTableBody.vue'
import type { ElmTableRowProps } from '../table/ElmTableRow.vue'
import type { ElmTableCellProps } from '../table/ElmTableCell.vue'
import type { ElmKatexProps } from '../code/ElmKatex.vue'
import type { ElmImageProps } from '../media/ElmImage.vue'
import type { ElmBlockImageProps } from '../media/ElmBlockImage.vue'
import type { ElmBookmarkProps } from '../navigation/ElmBookmark.vue'
import type { ElmToggleProps } from '../containments/ElmToggle.vue'
import type { ElmCheckboxProps } from '../form/ElmCheckbox.vue'
import type { ElmFileProps } from '../media/ElmFile.vue'
import type { ElmColumnProps } from '../containments/ElmColumn.vue'
import type { ElmColumnListProps } from '../containments/ElmColumnList.vue'

const ElmInlineText = defineAsyncComponent(
  () => import('../inline/ElmInlineText.vue')
)
const ElmInlineIcon = defineAsyncComponent(
  () => import('../inline/ElmInlineIcon.vue')
)
const ElmCallout = defineAsyncComponent(
  () => import('../typography/ElmCallout.vue')
)
const ElmBulletedList = defineAsyncComponent(
  () => import('../typography/ElmBulletedList.vue')
)
const ElmNumberedList = defineAsyncComponent(
  () => import('../typography/ElmNumberedList.vue')
)
const ElmListItem = defineAsyncComponent(
  () => import('../typography/ElmListItem.vue')
)
const ElmBlockQuote = defineAsyncComponent(
  () => import('../typography/ElmBlockQuote.vue')
)
const ElmDivider = defineAsyncComponent(
  () => import('../typography/ElmDivider.vue')
)
const ElmHeading = defineAsyncComponent(
  () => import('../typography/ElmHeading.vue')
)

const ElmCodeBlock = defineAsyncComponent(
  () => import('../code/ElmCodeBlock.vue')
)
const ElmParagraph = defineAsyncComponent(
  () => import('../typography/ElmParagraph.vue')
)
const ElmTable = defineAsyncComponent(() => import('../table/ElmTable.vue'))
const ElmTableHeader = defineAsyncComponent(
  () => import('../table/ElmTableHeader.vue')
)
const ElmTableBody = defineAsyncComponent(
  () => import('../table/ElmTableBody.vue')
)
const ElmTableRow = defineAsyncComponent(
  () => import('../table/ElmTableRow.vue')
)
const ElmTableCell = defineAsyncComponent(
  () => import('../table/ElmTableCell.vue')
)
const ElmKatex = defineAsyncComponent(() => import('../code/ElmKatex.vue'))
const ElmImage = defineAsyncComponent(() => import('../media/ElmImage.vue'))
const ElmBlockImage = defineAsyncComponent(
  () => import('../media/ElmBlockImage.vue')
)
const ElmBookmark = defineAsyncComponent(
  () => import('../navigation/ElmBookmark.vue')
)
const ElmToggle = defineAsyncComponent(
  () => import('../containments/ElmToggle.vue')
)
const ElmCheckbox = defineAsyncComponent(
  () => import('../form/ElmCheckbox.vue')
)
const ElmFile = defineAsyncComponent(() => import('../media/ElmFile.vue'))
const ElmColumn = defineAsyncComponent(
  () => import('../containments/ElmColumn.vue')
)
const ElmColumnList = defineAsyncComponent(
  () => import('../containments/ElmColumnList.vue')
)

import { h, markRaw, VNode } from 'vue'

type ComponentType =
  | 'ElmInlineText'
  | 'ElmInlineIcon'
  | 'ElmCallout'
  | 'ElmBulletedList'
  | 'ElmNumberedList'
  | 'ElmListItem'
  | 'ElmBlockQuote'
  | 'ElmDivider'
  | 'ElmHeading'
  | 'ElmCodeBlock'
  | 'ElmParagraph'
  | 'ElmTable'
  | 'ElmTableHeader'
  | 'ElmTableBody'
  | 'ElmTableRow'
  | 'ElmTableCell'
  | 'ElmKatex'
  | 'ElmImage'
  | 'ElmBlockImage'
  | 'ElmBookmark'
  | 'ElmToggle'
  | 'ElmCheckbox'
  | 'ElmFile'
  | 'ElmColumn'
  | 'ElmColumnList'

type ComponentProps =
  | ElmInlineTextProps
  | ElmInlineIconProps
  | ElmCalloutProps
  | ElmBulletedListProps
  | ElmNumberedListProps
  | ElmListItemProps
  | ElmBlockQuoteProps
  | ElmDividerProps
  | ElmHeadingProps
  | ElmCodeBlockProps
  | ElmParagraphProps
  | ElmTableProps
  | ElmTableHeaderProps
  | ElmTableBodyProps
  | ElmTableRowProps
  | ElmTableCellProps
  | ElmKatexProps
  | ElmImageProps
  | ElmBlockImageProps
  | ElmBookmarkProps
  | ElmToggleProps
  | ElmCheckboxProps
  | ElmFileProps
  | ElmColumnProps
  | ElmColumnListProps

interface JsonComponentBase {
  type: ComponentType
  id?: string
  props?: ComponentProps
  children?: JsonComponent[]
}

interface ElmInlineTextJsonComponent extends JsonComponentBase {
  type: 'ElmInlineText'
  id?: string
  props?: ElmInlineTextProps
}

interface ElmInlineIconJsonComponent extends JsonComponentBase {
  type: 'ElmInlineIcon'
  id?: string
  props?: ElmInlineIconProps
}

interface ElmCalloutJsonComponent extends JsonComponentBase {
  type: 'ElmCallout'
  id?: string
  props?: ElmCalloutProps
}

interface ElmBulletedListJsonComponent extends JsonComponentBase {
  type: 'ElmBulletedList'
  id?: string
  props?: ElmBulletedListProps
}

interface ElmNumberedListJsonComponent extends JsonComponentBase {
  type: 'ElmNumberedList'
  id?: string
  props?: ElmNumberedListProps
}

interface ElmListItemJsonComponent extends JsonComponentBase {
  type: 'ElmListItem'
  id?: string
  props?: ElmListItemProps
}

interface ElmBlockQuoteJsonComponent extends JsonComponentBase {
  type: 'ElmBlockQuote'
  id?: string
  props?: ElmBlockQuoteProps
}

interface ElmDividerJsonComponent extends JsonComponentBase {
  type: 'ElmDivider'
  id?: string
  props?: ElmDividerProps
}

interface ElmHeadingJsonComponent extends JsonComponentBase {
  type: 'ElmHeading'
  id?: string
  props?: ElmHeadingProps
}

interface ElmCodeBlockJsonComponent extends JsonComponentBase {
  type: 'ElmCodeBlock'
  id?: string
  props?: ElmCodeBlockProps
}

interface ElmParagraphJsonComponent extends JsonComponentBase {
  type: 'ElmParagraph'
  id?: string
  props?: ElmParagraphProps
}

interface ElmTableJsonComponent extends JsonComponentBase {
  type: 'ElmTable'
  id?: string
  props?: ElmTableProps
}

interface ElmTableHeaderJsonComponent extends JsonComponentBase {
  type: 'ElmTableHeader'
  id?: string
  props?: ElmTableHeaderProps
}

interface ElmTableBodyJsonComponent extends JsonComponentBase {
  type: 'ElmTableBody'
  id?: string
  props?: ElmTableBodyProps
}

interface ElmTableRowJsonComponent extends JsonComponentBase {
  type: 'ElmTableRow'
  id?: string
  props?: ElmTableRowProps
}

interface ElmTableCellJsonComponent extends JsonComponentBase {
  type: 'ElmTableCell'
  id?: string
  props?: ElmTableCellProps
}

interface ElmKatexJsonComponent extends JsonComponentBase {
  type: 'ElmKatex'
  id?: string
  props?: ElmKatexProps
}

interface ElmImageJsonComponent extends JsonComponentBase {
  type: 'ElmImage'
  id?: string
  props?: ElmImageProps
}

interface ElmBlockImageJsonComponent extends JsonComponentBase {
  type: 'ElmBlockImage'
  id?: string
  props?: ElmBlockImageProps
}

interface ElmBookmarkJsonComponent extends JsonComponentBase {
  type: 'ElmBookmark'
  id?: string
  props?: ElmBookmarkProps
}

interface ElmToggleJsonComponent extends JsonComponentBase {
  type: 'ElmToggle'
  id?: string
  props?: ElmToggleProps
}

interface ElmCheckboxJsonComponent extends JsonComponentBase {
  type: 'ElmCheckbox'
  id?: string
  props?: ElmCheckboxProps
}

interface ElmFileJsonComponent extends JsonComponentBase {
  type: 'ElmFile'
  id?: string
  props?: ElmFileProps
}

interface ElmColumnJsonComponent extends JsonComponentBase {
  type: 'ElmColumn'
  id?: string
  props?: ElmColumnProps
}

interface ElmColumnListJsonComponent extends JsonComponentBase {
  type: 'ElmColumnList'
  id?: string
  props?: ElmColumnListProps
}

type JsonComponent =
  | ElmInlineTextJsonComponent
  | ElmInlineIconJsonComponent
  | ElmCalloutJsonComponent
  | ElmBulletedListJsonComponent
  | ElmNumberedListJsonComponent
  | ElmListItemJsonComponent
  | ElmBlockQuoteJsonComponent
  | ElmDividerJsonComponent
  | ElmHeadingJsonComponent
  | ElmCodeBlockJsonComponent
  | ElmParagraphJsonComponent
  | ElmTableJsonComponent
  | ElmTableHeaderJsonComponent
  | ElmTableBodyJsonComponent
  | ElmTableRowJsonComponent
  | ElmTableCellJsonComponent
  | ElmKatexJsonComponent
  | ElmImageJsonComponent
  | ElmBlockImageJsonComponent
  | ElmBookmarkJsonComponent
  | ElmToggleJsonComponent
  | ElmCheckboxJsonComponent
  | ElmFileJsonComponent
  | ElmColumnJsonComponent
  | ElmColumnListJsonComponent

export interface ElmJsonRendererProps {
  json: JsonComponent[]
}

withDefaults(defineProps<ElmJsonRendererProps>(), {})

const componentMap: Record<ComponentType, any> = {
  ElmInlineText: markRaw(ElmInlineText),
  ElmInlineIcon: markRaw(ElmInlineIcon),
  ElmCallout: markRaw(ElmCallout),
  ElmBulletedList: markRaw(ElmBulletedList),
  ElmNumberedList: markRaw(ElmNumberedList),
  ElmListItem: markRaw(ElmListItem),
  ElmBlockQuote: markRaw(ElmBlockQuote),
  ElmDivider: markRaw(ElmDivider),
  ElmHeading: markRaw(ElmHeading),
  ElmCodeBlock: markRaw(ElmCodeBlock),
  ElmParagraph: markRaw(ElmParagraph),
  ElmTable: markRaw(ElmTable),
  ElmTableHeader: markRaw(ElmTableHeader),
  ElmTableBody: markRaw(ElmTableBody),
  ElmTableRow: markRaw(ElmTableRow),
  ElmTableCell: markRaw(ElmTableCell),
  ElmKatex: markRaw(ElmKatex),
  ElmImage: markRaw(ElmImage),
  ElmBlockImage: markRaw(ElmBlockImage),
  ElmBookmark: markRaw(ElmBookmark),
  ElmToggle: markRaw(ElmToggle),
  ElmCheckbox: markRaw(ElmCheckbox),
  ElmFile: markRaw(ElmFile),
  ElmColumn: markRaw(ElmColumn),
  ElmColumnList: markRaw(ElmColumnList)
}

const render = (json: JsonComponent[]) => {
  const vnodes: VNode[] = []
  for (const component of json) {
    vnodes.push(
      h(
        componentMap[component.type],
        { ...component.props, key: component.id },
        () => {
          if (component.children != null) {
            return render(component.children)
          }
        }
      )
    )
  }
  return vnodes
}
</script>
