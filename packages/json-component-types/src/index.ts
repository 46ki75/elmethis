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
  TableHeader: TableHeader
  TableBody: TableBody
  TableRow: TableRow
  TableCell: TableCell
}

export type ComponentMap = InlineComponentMap & BlockComponentMap

// Types
export type InlineComponentType = keyof InlineComponentMap
export type BlockComponentType = keyof BlockComponentMap
export type ComponentType = keyof ComponentMap

// Base Interfaces
export interface Component<
  T extends ComponentType = ComponentType,
  P = Record<any, any>
> {
  type: T
  inline: boolean
  props?: P
  slots?: Record<string, Component | Component[]>
}

export interface InlineComponent<
  T extends InlineComponentType = InlineComponentType,
  P = Record<any, any>
> extends Component<T, P> {
  inline: true
  slots?: undefined
}

export interface BlockComponent<
  T extends BlockComponentType = BlockComponentType,
  P = Record<any, any>
> extends Component<T, P> {
  inline: false
  slots?: Record<string, Component | Component[]>
}

// Inline Components
export interface Text extends InlineComponent<'Text'> {
  inline: true
  props: {
    text: string
    color?: string
    backgroundColor?: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
    code?: boolean
    ruby?: string
    href?: string
    favicon?: string
    expression?: string
  }
  slots?: undefined
}

export interface Icon extends InlineComponent<'Icon'> {
  inline: true
  props: {
    src: string
    alt?: string
  }
  slots?: undefined
}

// Block Components
export interface Heading extends BlockComponent<'Heading'> {
  inline: false
  props: { level: 1 | 2 | 3 | 4 | 5 | 6 }
  slots: { default: InlineComponent[] }
}

export interface Paragraph extends BlockComponent<'Paragraph'> {
  inline: false
  props?: undefined
  slots: { default: Component[] }
}

export interface ListItem extends BlockComponent<'ListItem'> {
  inline: false
  props?: undefined
  slots: { default: Component[] }
}

export interface List extends BlockComponent<'List'> {
  inline: false
  props?: { listStyle?: 'unordered' | 'ordered' }
  slots: { default: Component[] }
}

export interface BlockQuote extends BlockComponent<'BlockQuote'> {
  inline: false
  props?: { cite?: string }
  slots: { default: Component[] }
}

export interface Callout extends BlockComponent<'Callout'> {
  inline: false
  props?: { type?: 'note' | 'tip' | 'important' | 'warning' | 'caution' }
  slots: { default: Component[] }
}

export interface Divider extends BlockComponent<'Divider'> {}

export interface Toggle extends BlockComponent<'Toggle'> {
  inline: false
  props?: undefined
  slots: {
    default: Component[]
    summary: InlineComponent[]
  }
}

export interface Bookmark extends BlockComponent<'Bookmark'> {
  inline: false
  props: {
    url: string
    title?: string
    description?: string
    image?: string
  }
  slots?: undefined
}

export interface File extends BlockComponent<'File'> {
  inline: false
  props: {
    src: string
    name?: string
  }
  slots?: undefined
}

export interface Image extends BlockComponent<'Image'> {
  inline: false
  props: {
    src: string
    alt?: string
  }
  slots?: undefined
}

export interface CodeBlock extends BlockComponent<'CodeBlock'> {
  inline: false
  props: {
    code: string
    language: string
  }
  slots: {
    default: InlineComponent[]
  }
}

export interface Katex extends BlockComponent<'Katex'> {
  inline: false
  props: {
    expression: string
  }
  slots?: undefined
}

export interface Table extends BlockComponent<'Table'> {
  inline: false
  props?: { hasColumnHeader?: boolean; hasRowHeader?: boolean }
  slots: {
    header?: TableHeader
    body: TableBody
  }
}

export interface TableHeader extends BlockComponent<'TableHeader'> {
  inline: false
  props?: undefined
  slots: { default: TableRow }
}

export interface TableBody extends BlockComponent<'TableBody'> {
  inline: false
  props?: undefined
  slots: { default: TableRow[] }
}

export interface TableRow extends BlockComponent<'TableRow'> {
  inline: false
  props?: undefined
  slots: { default: TableCell[] }
}

export interface TableCell extends BlockComponent<'TableCell'> {
  inline: false
  props?: { isHeader?: boolean }
  slots: { default: InlineComponent }
}
