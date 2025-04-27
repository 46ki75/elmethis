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
    pub props: Option<ParagraphProps>,

    pub slots: ParagraphSlots,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ParagraphProps;

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub struct ParagraphSlots {
    pub default: Vec<InlineComponent>,
}
