// Component Map
export type InlineComponentMap = {
  Text: Text
  Icon: Icon
}

export type BlockComponentMap = {
  Heading: Heading
  Paragraph: Paragraph
  ListItem: ListItem
  List: List
  BlockQuote: BlockQuote
  Callout: Callout
  Divider: Divider
  Toggle: Toggle
  Bookmark: Bookmark
  File: File
  Image: Image
  CodeBlock: CodeBlock
  Katex: Katex
  Table: Table
  TableRow: TableRow
  TableCell: TableCell
}

export type ComponentMap = InlineComponentMap & BlockComponentMap

// Types
export type InlineComponentType = keyof InlineComponentMap
export type BlockComponentType = keyof BlockComponentMap
export type ComponentType = keyof ComponentMap

export type InlineComponent = InlineComponentMap[keyof InlineComponentMap]
export type BlockComponent = BlockComponentMap[keyof BlockComponentMap]
export type Component = ComponentMap[keyof ComponentMap]

// Base Interfaces
export interface ComponentBase<
  T extends ComponentType = ComponentType,
  P = Record<any, any>
> {
  type: T
  inline: boolean
  props?: P
  slots?: Record<string, ComponentBase | ComponentBase[]>
}

export interface InlineComponentBase<
  T extends InlineComponentType = InlineComponentType,
  P = Record<any, any>
> extends ComponentBase<T, P> {
  type: T
  inline: true
  props?: P
  slots?: undefined
}

export interface BlockComponentBase<
  T extends BlockComponentType = BlockComponentType,
  P = Record<any, any>
> extends ComponentBase<T, P> {
  type: T
  inline: false
  props?: P
  slots?: Record<string, Component | Component[]>
}

// Inline Components
export interface Text extends InlineComponentBase<'Text'> {
  type: 'Text'
  inline: true
  props: {
    text: string
    color?: string
    backgroundColor?: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
    katex?: boolean
    code?: boolean
    ruby?: string
    href?: string
    favicon?: string
  }
  slots?: undefined
}

export interface Icon extends InlineComponentBase<'Icon'> {
  type: 'Icon'
  inline: true
  props: {
    src: string
    alt?: string
  }
  slots?: undefined
}

// Block Components
export interface Heading extends BlockComponentBase<'Heading'> {
  type: 'Heading'
  inline: false
  props: { level: 1 | 2 | 3 | 4 | 5 | 6 }
  slots: { default: InlineComponent[] }
}

export interface Paragraph extends BlockComponentBase<'Paragraph'> {
  type: 'Paragraph'
  inline: false
  props?: undefined
  slots: { default: InlineComponent[] }
}

export interface ListItem extends BlockComponentBase<'ListItem'> {
  type: 'ListItem'
  inline: false
  props?: undefined
  slots: { default: InlineComponent[] }
}

export interface List extends BlockComponentBase<'List'> {
  type: 'List'
  inline: false
  props?: { listStyle?: 'unordered' | 'ordered' }
  slots: { default: ListItem[] }
}

export interface BlockQuote extends BlockComponentBase<'BlockQuote'> {
  type: 'BlockQuote'
  inline: false
  props?: { cite?: string }
  slots: { default: Component[] }
}

export interface Callout extends BlockComponentBase<'Callout'> {
  type: 'Callout'
  inline: false
  props?: { type?: 'note' | 'tip' | 'important' | 'warning' | 'caution' }
  slots: { default: Component[] }
}

export interface Divider extends BlockComponentBase<'Divider'> {
  type: 'Divider'
  inline: false
  props?: undefined
  slots?: undefined
}

export interface Toggle extends BlockComponentBase<'Toggle'> {
  type: 'Toggle'
  inline: false
  props?: undefined
  slots: {
    default: Component[]
    summary: InlineComponent[]
  }
}

export interface Bookmark extends BlockComponentBase<'Bookmark'> {
  type: 'Bookmark'
  inline: false
  props: {
    url: string
    title?: string
    description?: string
    image?: string
  }
  slots?: undefined
}

export interface File extends BlockComponentBase<'File'> {
  type: 'File'
  inline: false
  props: {
    src: string
    name?: string
  }
  slots?: undefined
}

export interface Image extends BlockComponentBase<'Image'> {
  type: 'Image'
  inline: false
  props: {
    src: string
    alt?: string
  }
  slots?: undefined
}

export interface CodeBlock extends BlockComponentBase<'CodeBlock'> {
  type: 'CodeBlock'
  inline: false
  props: {
    code: string
    language: string
  }
  slots: {
    default: InlineComponent[]
  }
}

export interface Katex extends BlockComponentBase<'Katex'> {
  type: 'Katex'
  inline: false
  props: {
    expression: string
  }
  slots?: undefined
}

export interface Table extends BlockComponentBase<'Table'> {
  type: 'Table'
  inline: false
  props?: { hasColumnHeader?: boolean; hasRowHeader?: boolean }
  slots: {
    header?: TableRow[]
    body: TableRow[]
  }
}

export interface TableRow extends BlockComponentBase<'TableRow'> {
  type: 'TableRow'
  inline: false
  props?: undefined
  slots: { default: TableCell[] }
}

export interface TableCell extends BlockComponentBase<'TableCell'> {
  type: 'TableCell'
  inline: false
  props?: { isHeader?: boolean }
  slots: { default: InlineComponent[] }
}
