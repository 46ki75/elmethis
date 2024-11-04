// badge
import ElmTag, { ElmTagProps } from './components/badge/ElmTag.vue'

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
import ElmDesktopWindow, {
  ElmDesktopWindowProps
} from './components/containments/ElmDesktopWindow.vue'
import ElmModal, { ElmModalProps } from './components/containments/ElmModal.vue'
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
import ElmLoginIcon, {
  ElmLoginIconProps
} from './components/icon/ElmLoginIcon.vue'
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

// others
import ElmColorSample, {
  ElmColorSampleProps
} from './components/others/ElmColorSample.vue'
import ElmColorTable, {
  ElmColorTableProps
} from './components/others/ElmColorTable.vue'

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
import ElmParagraph, {
  ElmParagraphProps
} from './components/typography/ElmParagraph.vue'
import ElmListItem, {
  ElmListItemProps
} from './components/typography/ElmListItem.vue'

// # --------------------------------------------------------------------------------
//
// hooks
//
// # --------------------------------------------------------------------------------

import { useElmethisTheme } from './hooks/useElmethisTheme'

export {
  ElmTag,
  ElmCodeBlock,
  ElmPrismHighlighter,
  ElmKatex,
  ElmColumn,
  ElmColumnList,
  ElmDesktopWindow,
  ElmModal,
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
  ElmLoginIcon,
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
  ElmColorSample,
  ElmColorTable,
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
  ElmParagraph,
  ElmListItem,
  useElmethisTheme
}

export type {
  ElmTagProps,
  ElmCodeBlockProps,
  ElmPrismHighlighterProps,
  ElmKatexProps,
  ElmColumnProps,
  ElmColumnListProps,
  ElmDesktopWindowProps,
  ElmModalProps,
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
  ElmLoginIconProps,
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
  ElmColorSampleProps,
  ElmColorTableProps,
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
  ElmParagraphProps,
  ElmListItemProps
}
