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

const LOREM_IPSUM = `
Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
when an unknown printer took a galley of type and scrambled it to make a type 
specimen book. It has survived not only five centuries, but also the leap 
into electronic typesetting, remaining essentially unchanged. It was popularised 
in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
and more recently with desktop publishing software like Aldus PageMaker 
including versions of Lorem Ipsum.
`

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

export const BlockQuote: Story = {
  args: {
    jsonComponents: [
      {
        type: 'BlockQuote',
        inline: false,
        props: { cite: 'https://www.lipsum.com/' },
        slots: {
          default: [
            {
              type: 'Text',
              inline: true,
              props: { text: LOREM_IPSUM }
            }
          ]
        }
      }
    ]
  }
}
