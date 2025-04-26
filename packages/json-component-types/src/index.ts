export type ComponentType =
  | 'Text'
  | 'Icon'
  | 'Paragraph'
  | 'ListItem'
  | 'BulletedList'
  | 'NumberedLists'

export interface Component<P = Record<any, any>> {
  type: ComponentType
  props?: P
  slots?: Record<string, Component[]>
}

export interface Text extends Component {
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
  }
}

export interface Icon extends Component {
  type: 'Icon'
  props: {
    src: string
    alt?: string
  }
}

export interface Paragraph extends Component {
  type: 'Paragraph'
  slots: { default: Component[] }
}

export interface ListItem extends Component {
  type: 'ListItem'
  slots: { default: Component[] }
}

export interface BulletedList extends Component {
  type: 'BulletedList'
  slots: { default: Component[] }
}

export interface NumberedLists extends Component {
  type: 'NumberedLists'
  slots: { default: Component[] }
}
