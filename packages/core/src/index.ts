import { App } from 'vue'

// code
import ElmCodeBlock, {
  ElmCodeBlockProps
} from './components/code/ElmCodeBlock.vue'
import ElmPrismHighlighter, {
  ElmPrismHighlighterProps
} from './components/code/ElmPrismHighlighter.vue'
import ElmKatex, { ElmKatexProps } from './components/code/ElmKatex.vue'

// containments
import ElmColumn, {
  ElmColumnProps
} from './components/containments/ElmColumn.vue'
import ElmColumnList, {
  ElmColumnListProps
} from './components/containments/ElmColumnList.vue'
import ElmParallax, {
  ElmParallaxProps
} from './components/containments/ElmParallax.vue'
import ElmToggle, {
  ElmToggleProps
} from './components/containments/ElmToggle.vue'
import ElmTooltip, {
  ElmTooltipProps
} from './components/containments/ElmTooltip.vue'

// data
import ElmProgress, {
  ElmProgressProps
} from './components/data/ElmProgress.vue'

// fallback
import ElmRectangleWave, {
  ElmRectangleWaveProps
} from './components/fallback/ElmRectangleWave.vue'

// Headings
import ElmHeading1, {
  ElmHeading1Props
} from './components/headings/ElmHeading1.vue'
import ElmHeading2, {
  ElmHeading2Props
} from './components/headings/ElmHeading2.vue'
import ElmHeading3, {
  ElmHeading3Props
} from './components/headings/ElmHeading3.vue'
import ElmHeading4, {
  ElmHeading4Props
} from './components/headings/ElmHeading4.vue'
import ElmHeading5, {
  ElmHeading5Props
} from './components/headings/ElmHeading5.vue'
import ElmHeading6, {
  ElmHeading6Props
} from './components/headings/ElmHeading6.vue'

// icon
import ElmCubeIcon, {
  ElmCubeIconProps
} from './components/icon/ElmCubeIcon.vue'
import ElmDotLoadingIcon, {
  ElmDotLoadingIconProps
} from './components/icon/ElmDotLoadingIcon.vue'
import ElmLanguageIcon, {
  ElmLanguageIconProps
} from './components/icon/ElmLanguageIcon.vue'
import ElmToggleTheme, {
  ElmToggleThemeProps
} from './components/icon/ElmToggleTheme.vue'

// inline
import ElmInlineCode, {
  ElmInlineCodeProps
} from './components/inline/ElmInlineCode.vue'
import ElmInlineLink, {
  ElmInlineLinkProps
} from './components/inline/ElmInlineLink.vue'
import ElmInlineRuby, {
  ElmInlineRubyProps
} from './components/inline/ElmInlineRuby.vue'
import ElmInlineText, {
  ElmInlineTextProps
} from './components/inline/ElmInlineText.vue'

// media
import ElmFile, { ElmFileProps } from './components/media/ElmFile.vue'
import ElmImage, { ElmImageProps } from './components/media/ElmImage.vue'

// navigation
import ElmBookmark, {
  ElmBookmarkProps
} from './components/navigation/ElmBookmark.vue'
import ElmBreadcrumb, {
  ElmBreadcrumbProps
} from './components/navigation/ElmBreadcrumb.vue'
import ElmPagetop, {
  ElmPagetopProps
} from './components/navigation/ElmPagetop.vue'
import ElmTableOfContents, {
  ElmTableOfContentsProps
} from './components/navigation/ElmTableOfContents.vue'

// renderer
import ElmJsonRenderer, {
  ElmJsonRendererProps
} from './components/renderer/ElmJsonRenderer.vue'

// table
import ElmTable, { ElmTableProps } from './components/table/ElmTable.vue'
import ElmTableHeader, {
  ElmTableHeaderProps
} from './components/table/ElmTableHeader.vue'
import ElmTableBody, {
  ElmTableBodyProps
} from './components/table/ElmTableBody.vue'
import ElmTableRow, {
  ElmTableRowProps
} from './components/table/ElmTableRow.vue'
import ElmTableCell, {
  ElmTableCellProps
} from './components/table/ElmTableCell.vue'

// typography
import ElmBlockQuote, {
  ElmBlockQuoteProps
} from './components/typography/ElmBlockQuote.vue'
import ElmBulletedList, {
  ElmBulletedListProps
} from './components/typography/ElmBulletedList.vue'
import ElmCallout, {
  ElmCalloutProps
} from './components/typography/ElmCallout.vue'
import ElmDivider, {
  ElmDividerProps
} from './components/typography/ElmDivider.vue'
import ElmNumberedList, {
  ElmNumberedListProps
} from './components/typography/ElmNumberedList.vue'
import ElmListItem, {
  ElmListItemProps
} from './components/typography/ElmListItem.vue'

export {
  ElmCodeBlock,
  ElmPrismHighlighter,
  ElmKatex,
  ElmColumn,
  ElmColumnList,
  ElmParallax,
  ElmToggle,
  ElmTooltip,
  ElmProgress,
  ElmRectangleWave,
  ElmHeading1,
  ElmHeading2,
  ElmHeading3,
  ElmHeading4,
  ElmHeading5,
  ElmHeading6,
  ElmCubeIcon,
  ElmDotLoadingIcon,
  ElmLanguageIcon,
  ElmToggleTheme,
  ElmInlineCode,
  ElmInlineLink,
  ElmInlineRuby,
  ElmInlineText,
  ElmFile,
  ElmImage,
  ElmBookmark,
  ElmBreadcrumb,
  ElmPagetop,
  ElmTableOfContents,
  ElmJsonRenderer,
  ElmTable,
  ElmTableHeader,
  ElmTableBody,
  ElmTableRow,
  ElmTableCell,
  ElmBlockQuote,
  ElmBulletedList,
  ElmCallout,
  ElmDivider,
  ElmNumberedList,
  ElmListItem
}

export type {
  ElmCodeBlockProps,
  ElmPrismHighlighterProps,
  ElmKatexProps,
  ElmColumnProps,
  ElmColumnListProps,
  ElmParallaxProps,
  ElmToggleProps,
  ElmTooltipProps,
  ElmProgressProps,
  ElmRectangleWaveProps,
  ElmHeading1Props,
  ElmHeading2Props,
  ElmHeading3Props,
  ElmHeading4Props,
  ElmHeading5Props,
  ElmHeading6Props,
  ElmCubeIconProps,
  ElmDotLoadingIconProps,
  ElmLanguageIconProps,
  ElmToggleThemeProps,
  ElmInlineCodeProps,
  ElmInlineLinkProps,
  ElmInlineRubyProps,
  ElmInlineTextProps,
  ElmFileProps,
  ElmImageProps,
  ElmBookmarkProps,
  ElmBreadcrumbProps,
  ElmPagetopProps,
  ElmTableOfContentsProps,
  ElmJsonRendererProps,
  ElmTableProps,
  ElmTableHeaderProps,
  ElmTableBodyProps,
  ElmTableRowProps,
  ElmTableCellProps,
  ElmBlockQuoteProps,
  ElmBulletedListProps,
  ElmCalloutProps,
  ElmDividerProps,
  ElmNumberedListProps,
  ElmListItemProps
}

export const ElmethisPlugin = {
  install(app: App): void {
    app.component('ElmCodeBlock', ElmCodeBlock)
    app.component('ElmPrismHighlighter', ElmPrismHighlighter)
    app.component('ElmKatex', ElmKatex)
    app.component('ElmColumn', ElmColumn)
    app.component('ElmColumnList', ElmColumnList)
    app.component('ElmParallax', ElmParallax)
    app.component('ElmToggle', ElmToggle)
    app.component('ElmTooltip', ElmTooltip)
    app.component('ElmProgress', ElmProgress)
    app.component('ElmRectangleWave', ElmRectangleWave)
    app.component('ElmHeading1', ElmHeading1)
    app.component('ElmHeading2', ElmHeading2)
    app.component('ElmHeading3', ElmHeading3)
    app.component('ElmHeading4', ElmHeading4)
    app.component('ElmHeading5', ElmHeading5)
    app.component('ElmHeading6', ElmHeading6)
    app.component('ElmCubeIcon', ElmCubeIcon)
    app.component('ElmDotLoadingIcon', ElmDotLoadingIcon)
    app.component('ElmLanguageIcon', ElmLanguageIcon)
    app.component('ElmToggleTheme', ElmToggleTheme)
    app.component('ElmInlineCode', ElmInlineCode)
    app.component('ElmInlineLink', ElmInlineLink)
    app.component('ElmInlineRuby', ElmInlineRuby)
    app.component('ElmInlineText', ElmInlineText)
    app.component('ElmFile', ElmFile)
    app.component('ElmImage', ElmImage)
    app.component('ElmBookmark', ElmBookmark)
    app.component('ElmBreadcrumb', ElmBreadcrumb)
    app.component('ElmPagetop', ElmPagetop)
    app.component('ElmTableOfContents', ElmTableOfContents)
    app.component('ElmJsonRenderer', ElmJsonRenderer)
    app.component('ElmTable', ElmTable)
    app.component('ElmTableHeader', ElmTableHeader)
    app.component('ElmTableBody', ElmTableBody)
    app.component('ElmTableRow', ElmTableRow)
    app.component('ElmTableCell', ElmTableCell)
    app.component('ElmBlockQuote', ElmBlockQuote)
    app.component('ElmBulletedList', ElmBulletedList)
    app.component('ElmCallout', ElmCallout)
    app.component('ElmDivider', ElmDivider)
    app.component('ElmNumberedList', ElmNumberedList)
    app.component('ElmListItem', ElmListItem)
  }
}
