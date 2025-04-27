use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub enum Component {
    InlineComponent(InlineComponent),
    BlockComponent(BlockComponent),
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub enum InlineComponent {
    Text(Text),
    Icon(Icon),
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub enum BlockComponent {
    Heading(Heading),
    Paragraph(Paragraph),
}

// Text # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Text {
    /// Always "Text".
    pub r#type: String,
    /// Always `true`
    pub inline: bool,

    pub props: TextProps,
    // Always `None`
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slots: Option<TextSlots>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TextProps {
    pub text: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub background_color: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub bold: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub italic: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub underline: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub strikethrough: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub katex: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ruby: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub favicon: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TextSlots;

// Icon # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Icon {
    /// Always "Icon".
    pub r#type: String,

    /// Always `true`
    pub inline: bool,

    pub props: IconProps,

    // Always `None`
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slots: Option<IconSlots>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct IconProps {
    pub src: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub alt: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct IconSlots;

// Heading # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Heading {
    /// Always "Heading".
    pub r#type: String,

    /// Always `false`
    pub inline: bool,

    pub props: HeadingProps,

    pub slots: HeadingSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
#[serde(try_from = "u8", into = "u8")]
pub enum HeadingLevel {
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
}

impl From<HeadingLevel> for u8 {
    fn from(level: HeadingLevel) -> Self {
        match level {
            HeadingLevel::H1 => 1,
            HeadingLevel::H2 => 2,
            HeadingLevel::H3 => 3,
            HeadingLevel::H4 => 4,
            HeadingLevel::H5 => 5,
            HeadingLevel::H6 => 6,
        }
    }
}

impl TryFrom<u8> for HeadingLevel {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            1 => Ok(HeadingLevel::H1),
            2 => Ok(HeadingLevel::H2),
            3 => Ok(HeadingLevel::H3),
            4 => Ok(HeadingLevel::H4),
            5 => Ok(HeadingLevel::H5),
            6 => Ok(HeadingLevel::H6),
            _ => Err(format!("Invalid heading level: {}", value)),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct HeadingProps {
    pub level: HeadingLevel,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct HeadingSlots {
    pub default: Vec<InlineComponent>,
}

// Paragraph # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Paragraph {
    /// Always "Paragraph".
    pub r#type: String,

    /// Always `false`
    pub inline: bool,

    // Always `None`
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<ParagraphProps>,

    pub slots: ParagraphSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ParagraphProps;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ParagraphSlots {
    pub default: Vec<InlineComponent>,
}

// ListItem # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ListItem {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<ListItemProps>,
    pub slots: ListItemSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ListItemProps;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ListItemSlots {
    pub default: Vec<InlineComponent>,
}

// List # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct List {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<ListProps>,
    pub slots: ListSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ListProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub list_style: Option<ListStyle>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ListStyle {
    Unordered,
    Ordered,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ListSlots {
    pub default: Vec<ListItem>,
}

// BlockQuote # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct BlockQuote {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<BlockQuoteProps>,
    pub slots: BlockQuoteSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct BlockQuoteProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cite: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct BlockQuoteSlots {
    pub default: Vec<Component>,
}

// Callout # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Callout {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<CalloutProps>,
    pub slots: CalloutSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CalloutType {
    Note,
    Tip,
    Important,
    Warning,
    Caution,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct CalloutProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<CalloutType>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct CalloutSlots {
    pub default: Vec<Component>,
}

// Divider # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Divider {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<DividerProps>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slots: Option<DividerSlots>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct DividerProps;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct DividerSlots;

// Toggle # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Toggle {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<ToggleProps>,
    pub slots: ToggleSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ToggleProps;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ToggleSlots {
    pub default: Vec<Component>,
    pub summary: Vec<InlineComponent>,
}

// Bookmark # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Bookmark {
    pub r#type: String,
    pub inline: bool,
    pub props: BookmarkProps,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slots: Option<BookmarkSlots>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct BookmarkProps {
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct BookmarkSlots;

// File # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct File {
    pub r#type: String,
    pub inline: bool,
    pub props: FileProps,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slots: Option<FileSlots>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct FileProps {
    pub src: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct FileSlots;

// Image # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Image {
    pub r#type: String,
    pub inline: bool,
    pub props: ImageProps,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slots: Option<ImageSlots>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ImageProps {
    pub src: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alt: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ImageSlots;

// CodeBlock # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct CodeBlock {
    pub r#type: String,
    pub inline: bool,
    pub props: CodeBlockProps,
    pub slots: CodeBlockSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct CodeBlockProps {
    pub code: String,
    pub language: String,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct CodeBlockSlots {
    pub default: Vec<InlineComponent>,
}

// Katex # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Katex {
    pub r#type: String,
    pub inline: bool,
    pub props: KatexProps,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slots: Option<KatexSlots>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct KatexProps {
    pub expression: String,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct KatexSlots;

// Table # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct Table {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<TableProps>,
    pub slots: TableSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_column_header: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_row_header: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub caption: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableSlots {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub header: Option<Vec<TableRow>>,
    pub body: Vec<TableRow>,
}

// TableRow # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableRow {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<TableRowProps>,
    pub slots: TableRowSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableRowProps;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableRowSlots {
    pub default: Vec<TableCell>,
}

// TableCell # -------------------------------------------------- #
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableCell {
    pub r#type: String,
    pub inline: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub props: Option<TableCellProps>,
    pub slots: TableCellSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableCellProps {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_header: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct TableCellSlots {
    pub default: Vec<InlineComponent>,
}
