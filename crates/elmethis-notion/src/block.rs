use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(tag = "type")]
pub enum Block {
    ElmListItem(ElmListItem),
    ElmBulletedList(ElmBulletedList),
    ElmNumberedList(ElmNumberedList),
    ElmBookmark(ElmBookmark),
    ElmCodeBlock(ElmCodeBlock),
    ElmDivider(ElmDivider),
    ElmCallout(ElmCallout),
    ElmColumnList(ElmColumnList),
    ElmColumn(ElmColumn),
    ElmFile(ElmFile),
    ElmHeading1(ElmHeading1),
    ElmHeading2(ElmHeading2),
    ElmHeading3(ElmHeading3),
    ElmImage(ElmImage),
    ElmKatex(ElmKatex),
    ElmParagraph(ElmParagraph),
    ElmBlockQuote(ElmBlockQuote),
    ElmCheckbox(ElmCheckbox),
    ElmToggle(ElmToggle),
    ElmTable(ElmTable),
    ElmTableHeader(ElmTableHeader),
    ElmTableBody(ElmTableBody),
    ElmTableRow(ElmTableRow),
    ElmTableCell(ElmTableCell),
    ElmInlineText(ElmInlineText),
}

// ListItem
#[derive(Serialize, Clone)]
pub struct ElmListItem {
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmBulletedList {
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmNumberedList {
    pub children: Vec<Block>,
}

// ElmBookmark
#[derive(Serialize, Clone)]
pub struct ElmBookmark {
    pub props: ElmBookmarkProps,
}

#[derive(Serialize, Clone, Default)]
pub struct ElmBookmarkProps {
    pub title: String,
    pub description: String,
    pub image: String,
    pub url: String,
    pub margin: String,
}

// CodeBlock
#[derive(Serialize, Clone)]
pub struct ElmCodeBlock {
    pub props: ElmCodeBlockProps,
}

#[derive(Serialize, Clone)]
pub struct ElmCodeBlockProps {
    pub code: String,
    pub language: String,
    pub caption: String,
    pub margin: String,
}

// Divider
#[derive(Serialize, Clone)]
pub struct ElmDivider {
    pub props: ElmDividerProps,
}

#[derive(Serialize, Clone)]
pub struct ElmDividerProps {
    pub margin: String,
}

// Callout
#[derive(Serialize, Clone)]
pub struct ElmCallout {
    pub props: ElmCalloutProps,
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmCalloutProps {
    pub r#type: String,
}

// ColumnList
#[derive(Serialize, Clone)]
pub struct ElmColumnList {
    pub children: Vec<Block>,
}

// ColumnList
#[derive(Serialize, Clone)]
pub struct ElmColumn {
    pub children: Vec<Block>,
}

// Equation
#[derive(Serialize, Clone)]
pub struct ElmKatex {
    pub props: ElmKatexProps,
}

#[derive(Serialize, Clone)]
pub struct ElmKatexProps {
    pub expression: String,
    pub block: bool,
}

// File
#[derive(Serialize, Clone)]
pub struct ElmFile {
    pub props: ElmFileProps,
}

#[derive(Serialize, Clone)]
pub struct ElmFileProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    pub src: String,
    pub margin: String,
}

// Heading1
#[derive(Serialize, Clone)]
pub struct ElmHeading1 {
    pub props: ElmHeadingProps,
}

#[derive(Serialize, Clone)]
pub struct ElmHeading2 {
    pub props: ElmHeadingProps,
}

#[derive(Serialize, Clone)]
pub struct ElmHeading3 {
    pub props: ElmHeadingProps,
}

#[derive(Serialize, Clone)]
pub struct ElmHeadingProps {
    pub text: String,
}

// Image
#[derive(Serialize, Clone)]
pub struct ElmImage {
    pub props: ElmImageProps,
}

#[derive(Serialize, Clone)]
pub struct ElmImageProps {
    pub src: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alt: Option<String>,
    #[serde(rename = "enableModal")]
    pub enable_modal: bool,
    pub margin: String,
}

// Paragraph
#[derive(Serialize, Clone)]
pub struct ElmParagraph {
    pub children: Vec<Block>,
}

// Quote
#[derive(Serialize, Clone)]
pub struct ElmBlockQuote {
    pub children: Vec<Block>,
}

// ElmCheck
#[derive(Serialize, Clone)]
pub struct ElmCheckbox {
    pub props: ElmCheckboxProps,
}

#[derive(Serialize, Clone)]
pub struct ElmCheckboxProps {
    pub label: String,
}

// Toggle
#[derive(Serialize, Clone)]
pub struct ElmToggle {
    pub props: ElmToggleProps,
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmToggleProps {
    pub summary: String,
    pub margin: String,
}

// ElmTable
#[derive(Serialize, Clone)]
pub struct ElmTable {
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmTableHeader {
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmTableBody {
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmTableRow {
    pub children: Vec<Block>,
}

#[derive(Serialize, Clone)]
pub struct ElmTableCell {
    pub props: ElmTableCellProps,
}

#[derive(Serialize, Clone)]
pub struct ElmTableCellProps {
    pub text: String,
    #[serde(rename = "hasHeader")]
    pub has_header: bool,
}

// InlineText
#[derive(Serialize, Clone)]
pub struct ElmInlineText {
    pub props: ElmInlineTextProps,
}

#[derive(Serialize, Clone)]
pub struct ElmInlineTextProps {
    pub text: String,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
    pub strikethrough: bool,
    pub code: bool,
    pub color: notionrs::Color,
}
