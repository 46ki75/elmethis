export type InlineComponentType = 'Text' | 'Icon'

export type BlockComponentType =
  | 'Heading'
  | 'Paragraph'
  | 'ListItem'
  | 'List'
  | 'BlockQuote'
  | 'Callout'
  | 'Divider'
  | 'Toggle'
  | 'Bookmark'
  | 'File'
  | 'Image'
  | 'CodeBlock'
  | 'Katex'

export type ComponentType = InlineComponentType | BlockComponentType

export interface Component<P = Record<any, any>> {
  type: ComponentType
  props?: P
  slots?: Record<string, Component[]>
}

export interface InlineComponent<P = Record<any, any>> extends Component {
  type: ComponentType
  props?: P
  slots: undefined
}

export interface BlockComponent<P = Record<any, any>> extends Component {
  type: ComponentType
  props?: P
  slots?: Record<string, Component[]>
}

// Inline Components # -------------------------------------------------- #

export interface Text extends InlineComponent {
  type: 'Text'
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

    /**
     * KaTex expression.
     */
    expression?: string
  }
}

export interface Icon extends InlineComponent {
  type: 'Icon'
  props: {
    src: string
    alt?: string
  }
}

// Block Components # -------------------------------------------------- #

export interface Heading extends BlockComponent {
  type: 'Heading'
  props: {
    level: 1 | 2 | 3 | 4 | 5 | 6
  }
  slots: { default: InlineComponent[] }
}

export interface Paragraph extends BlockComponent {
  type: 'Paragraph'
  slots: { default: Component[] }
}

export interface ListItem extends BlockComponent {
  type: 'ListItem'
  slots: { default: Component[] }
}

export interface List extends BlockComponent {
  type: 'List'
  props?: { listStyle?: 'unordered' | 'ordered' }
  slots: { default: Component[] }
}

export interface BlockQuote extends BlockComponent {
  type: 'BlockQuote'
  props?: { cite?: string }
  slots: { default: Component[] }
}

export interface Callout extends BlockComponent {
  type: 'Callout'
  props?: { type?: 'note' | 'tip' | 'important' | 'warning' | 'caution' }
  slots: { default: Component[] }
}

export interface Divider extends BlockComponent {
  type: 'Divider'
}

export interface Toggle extends BlockComponent {
  type: 'Toggle'
  slots: {
    default: Component[]
    summary: InlineComponent[]
  }
}

export interface Bookmark extends BlockComponent {
  type: 'Bookmark'
  props: {
    url: string
    title?: string
    description?: string
    image?: string
  }
}

export interface File extends BlockComponent {
  type: 'File'
  props: {
    src: string
    name?: string
  }
}

export interface Image extends BlockComponent {
  type: 'Image'
  props: {
    src: string
    alt?: string
  }
}

export interface CodeBlock extends BlockComponent {
  type: 'CodeBlock'
  props: {
    code: string
    language: string
  }
  slots: {
    /**
     * Caption of the code.
     */
    default: InlineComponent[]
  }
}

export interface Katex extends BlockComponent {
  type: 'Katex'
  props: {
    expression: string
  }
}
