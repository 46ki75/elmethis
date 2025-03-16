<template>
  <component :is="() => render(json)" />
</template>

<script setup lang="ts">
import ElmInlineText, { ElmInlineTextProps } from '../inline/ElmInlineText.vue'
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
import ElmCodeBlock, { ElmCodeBlockProps } from '../code/ElmCodeBlock.vue'
import ElmParagraph, { ElmParagraphProps } from '../typography/ElmParagraph.vue'
import ElmTable, { ElmTableProps } from '../table/ElmTable.vue'
import ElmTableHeader, {
  ElmTableHeaderProps
} from '../table/ElmTableHeader.vue'
import ElmTableBody, { ElmTableBodyProps } from '../table/ElmTableBody.vue'
import ElmTableRow, { ElmTableRowProps } from '../table/ElmTableRow.vue'
import ElmTableCell, { ElmTableCellProps } from '../table/ElmTableCell.vue'
import ElmKatex, { ElmKatexProps } from '../code/ElmKatex.vue'
import ElmImage, { ElmImageProps } from '../media/ElmImage.vue'
import ElmBookmark, { ElmBookmarkProps } from '../navigation/ElmBookmark.vue'
import ElmToggle, { ElmToggleProps } from '../containments/ElmToggle.vue'
import ElmCheckbox, { ElmCheckboxProps } from '../form/ElmCheckbox.vue'
import ElmFile, { ElmFileProps } from '../media/ElmFile.vue'
import ElmColumn, { ElmColumnProps } from '../containments/ElmColumn.vue'
import ElmColumnList, {
  ElmColumnListProps
} from '../containments/ElmColumnList.vue'

import { h, markRaw, VNode } from 'vue'

type ComponentType =
  | 'ElmInlineText'
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
  | 'ElmCodeBlock'
  | 'ElmParagraph'
  | 'ElmTable'
  | 'ElmTableHeader'
  | 'ElmTableBody'
  | 'ElmTableRow'
  | 'ElmTableCell'
  | 'ElmKatex'
  | 'ElmImage'
  | 'ElmBookmark'
  | 'ElmToggle'
  | 'ElmCheckbox'
  | 'ElmFile'
  | 'ElmColumn'
  | 'ElmColumnList'

type ComponentProps =
  | ElmInlineTextProps
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
  | ElmCodeBlockProps
  | ElmParagraphProps
  | ElmTableProps
  | ElmTableHeaderProps
  | ElmTableBodyProps
  | ElmTableRowProps
  | ElmTableCellProps
  | ElmKatexProps
  | ElmImageProps
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

interface ElmInlineLinkJsonComponent extends JsonComponentBase {
  type: 'ElmInlineLink'
  id?: string
  props?: ElmInlineLinkProps
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

interface ElmHeading1JsonComponent extends JsonComponentBase {
  type: 'ElmHeading1'
  id?: string
  props?: ElmHeading1Props
}

interface ElmHeading2JsonComponent extends JsonComponentBase {
  type: 'ElmHeading2'
  id?: string
  props?: ElmHeading2Props
}

interface ElmHeading3JsonComponent extends JsonComponentBase {
  type: 'ElmHeading3'
  id?: string
  props?: ElmHeading3Props
}

interface ElmHeading4JsonComponent extends JsonComponentBase {
  type: 'ElmHeading4'
  id?: string
  props?: ElmHeading4Props
}

interface ElmHeading5JsonComponent extends JsonComponentBase {
  type: 'ElmHeading5'
  id?: string
  props?: ElmHeading5Props
}

interface ElmHeading6JsonComponent extends JsonComponentBase {
  type: 'ElmHeading6'
  id?: string
  props?: ElmHeading6Props
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
  | ElmCodeBlockJsonComponent
  | ElmParagraphJsonComponent
  | ElmTableJsonComponent
  | ElmTableHeaderJsonComponent
  | ElmTableBodyJsonComponent
  | ElmTableRowJsonComponent
  | ElmTableCellJsonComponent
  | ElmKatexJsonComponent
  | ElmImageJsonComponent
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
  ElmInlineLink: markRaw(ElmInlineLink),
  ElmCallout: markRaw(ElmCallout),
  ElmBulletedList: markRaw(ElmBulletedList),
  ElmNumberedList: markRaw(ElmNumberedList),
  ElmListItem: markRaw(ElmListItem),
  ElmBlockQuote: markRaw(ElmBlockQuote),
  ElmDivider: markRaw(ElmDivider),
  ElmHeading1: markRaw(ElmHeading1),
  ElmHeading2: markRaw(ElmHeading2),
  ElmHeading3: markRaw(ElmHeading3),
  ElmHeading4: markRaw(ElmHeading4),
  ElmHeading5: markRaw(ElmHeading5),
  ElmHeading6: markRaw(ElmHeading6),
  ElmCodeBlock: markRaw(ElmCodeBlock),
  ElmParagraph: markRaw(ElmParagraph),
  ElmTable: markRaw(ElmTable),
  ElmTableHeader: markRaw(ElmTableHeader),
  ElmTableBody: markRaw(ElmTableBody),
  ElmTableRow: markRaw(ElmTableRow),
  ElmTableCell: markRaw(ElmTableCell),
  ElmKatex: markRaw(ElmKatex),
  ElmImage: markRaw(ElmImage),
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
