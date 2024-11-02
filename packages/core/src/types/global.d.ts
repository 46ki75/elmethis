import {
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
} from '../index'

declare module 'vue' {
  interface GlobalComponents {
    ElmCodeBlock: (props: ElmCodeBlockProps) => JSX.Element
    ElmPrismHighlighter: (props: ElmPrismHighlighterProps) => JSX.Element
    ElmKatex: (props: ElmKatexProps) => JSX.Element

    ElmColumn: (props: ElmColumnProps) => JSX.Element
    ElmColumnList: (props: ElmColumnListProps) => JSX.Element
    ElmParallax: (props: ElmParallaxProps) => JSX.Element
    ElmToggle: (props: ElmToggleProps) => JSX.Element
    ElmTooltip: (props: ElmTooltipProps) => JSX.Element

    ElmProgress: (props: ElmProgressProps) => JSX.Element
    ElmRectangleWave: (props: ElmRectangleWaveProps) => JSX.Element

    ElmHeading1: (props: ElmHeading1Props) => JSX.Element
    ElmHeading2: (props: ElmHeading2Props) => JSX.Element
    ElmHeading3: (props: ElmHeading3Props) => JSX.Element
    ElmHeading4: (props: ElmHeading4Props) => JSX.Element
    ElmHeading5: (props: ElmHeading5Props) => JSX.Element
    ElmHeading6: (props: ElmHeading6Props) => JSX.Element

    ElmCubeIcon: (props: ElmCubeIconProps) => JSX.Element
    ElmDotLoadingIcon: (props: ElmDotLoadingIconProps) => JSX.Element
    ElmLanguageIcon: (props: ElmLanguageIconProps) => JSX.Element
    ElmToggleTheme: (props: ElmToggleThemeProps) => JSX.Element

    ElmInlineCode: (props: ElmInlineCodeProps) => JSX.Element
    ElmInlineLink: (props: ElmInlineLinkProps) => JSX.Element
    ElmInlineRuby: (props: ElmInlineRubyProps) => JSX.Element
    ElmInlineText: (props: ElmInlineTextProps) => JSX.Element

    ElmFile: (props: ElmFileProps) => JSX.Element
    ElmImage: (props: ElmImageProps) => JSX.Element

    ElmBookmark: (props: ElmBookmarkProps) => JSX.Element
    ElmBreadcrumb: (props: ElmBreadcrumbProps) => JSX.Element
    ElmPagetop: (props: ElmPagetopProps) => JSX.Element
    ElmTableOfContents: (props: ElmTableOfContentsProps) => JSX.Element

    ElmJsonRenderer: (props: ElmJsonRendererProps) => JSX.Element

    ElmTable: (props: ElmTableProps) => JSX.Element
    ElmTableHeader: (props: ElmTableHeaderProps) => JSX.Element
    ElmTableBody: (props: ElmTableBodyProps) => JSX.Element
    ElmTableRow: (props: ElmTableRowProps) => JSX.Element
    ElmTableCell: (props: ElmTableCellProps) => JSX.Element

    ElmBlockQuote: (props: ElmBlockQuoteProps) => JSX.Element
    ElmBulletedList: (props: ElmBulletedListProps) => JSX.Element
    ElmCallout: (props: ElmCalloutProps) => JSX.Element
    ElmDivider: (props: ElmDividerProps) => JSX.Element
    ElmNumberedList: (props: ElmNumberedListProps) => JSX.Element
    ElmListItem: (props: ElmListItemProps) => JSX.Element
  }
}
