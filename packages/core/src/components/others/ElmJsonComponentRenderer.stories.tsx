import type { Meta, StoryObj } from '@storybook/vue3'
import ElmJsonComponentRenderer from './ElmJsonComponentRenderer.vue'
import type { Component, InlineComponent } from '@elmethis/json-component-types'

const meta: Meta<typeof ElmJsonComponentRenderer> = {
  title: 'Components/others/ElmJsonComponentRenderer',
  component: ElmJsonComponentRenderer,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

const INLINE_TEMPLATE: InlineComponent[] = [
  {
    type: 'Text',
    inline: true,
    props: {
      text: 'Hello, '
    }
  },
  {
    type: 'Text',
    inline: true,
    props: {
      text: 'world',
      bold: true,
      color: '#6987b8'
    }
  },
  {
    type: 'Text',
    inline: true,
    props: {
      text: ' !'
    }
  }
] as const

export const Primary: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Paragraph',
        inline: false,
        slots: {
          default: INLINE_TEMPLATE
        }
      }
    ]
  }
}

export const Heading: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Heading',
        inline: false,
        props: {
          level: 1
        },
        slots: {
          default: INLINE_TEMPLATE
        }
      }
    ]
  }
}

const LIST_TEMPLATE: (listStyle: 'unordered' | 'ordered') => Component[] = (
  listStyle
) => [
  {
    type: 'List',
    inline: false,
    props: {
      listStyle
    },
    slots: {
      default: [
        ...new Array(3).fill({
          type: 'ListItem',
          inline: false,
          slots: {
            default: [
              ...INLINE_TEMPLATE,
              {
                type: 'List',
                inline: false,
                props: {
                  listStyle
                },
                slots: {
                  default: [
                    ...new Array(3).fill({
                      type: 'ListItem',
                      inline: false,
                      slots: { default: INLINE_TEMPLATE }
                    })
                  ]
                }
              }
            ]
          }
        })
      ]
    }
  }
]

export const UnorderedList: Story = {
  args: {
    jsonComponents: LIST_TEMPLATE('unordered')
  }
}

export const OrderedList: Story = {
  args: {
    jsonComponents: LIST_TEMPLATE('ordered')
  }
}
