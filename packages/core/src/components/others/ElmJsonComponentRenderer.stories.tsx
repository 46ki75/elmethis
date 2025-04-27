import type { Meta, StoryObj } from '@storybook/vue3'
import ElmJsonComponentRenderer from './ElmJsonComponentRenderer.vue'
import type { Component, InlineComponent } from '@elmethis/json-component-types'

import file from '../../assets/vite.svg'
import rustCode from '../code/seed/main.rs?raw'

const meta: Meta<typeof ElmJsonComponentRenderer> = {
  title: 'Components/Others/ElmJsonComponentRenderer',
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

export const InlineIcon: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Paragraph',
        inline: false,
        slots: {
          default: [
            {
              type: 'Text',
              inline: true,
              props: {
                text: 'I love'
              }
            },
            {
              type: 'Icon',
              inline: true,
              props: {
                src: 'https://www.rust-lang.org/static/images/rust-logo-blk.svg'
              }
            },
            {
              type: 'Text',
              inline: true,
              props: {
                text: 'Rust'
              }
            }
          ]
        }
      }
    ]
  }
}

export const InlineKatex: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Paragraph',
        inline: false,
        slots: {
          default: [
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
                text: 'E = mc^2',
                katex: true
              }
            },
            {
              type: 'Text',
              inline: true,
              props: {
                text: ' !'
              }
            }
          ]
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

export const Callout: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Callout',
        inline: false,
        props: { type: 'warning' },
        slots: {
          default: [
            {
              type: 'Paragraph',
              inline: false,
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
    ]
  }
}

export const Divider: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Divider',
        inline: false
      }
    ]
  }
}

export const Toggle: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Toggle',
        inline: false,
        slots: {
          default: [
            {
              type: 'Paragraph',
              inline: false,
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
          ],
          summary: [
            {
              type: 'Text',
              inline: true,
              props: { text: 'Hello, world !' }
            }
          ]
        }
      }
    ]
  }
}

export const Bookmark: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Bookmark',
        inline: false,
        props: {
          url: 'https://pnpm.io/',
          title: '	Fast, disk space efficient package manager | pnpm',
          description: 'Fast, disk space efficient package manager',
          image: 'https://pnpm.io/img/ogimage.png'
        }
      }
    ]
  }
}

export const File: Story = {
  args: {
    jsonComponents: [
      {
        type: 'File',
        inline: false,
        props: {
          src: file,
          name: 'Example File'
        }
      }
    ]
  }
}

export const Image: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Image',
        inline: false,
        props: {
          src: 'https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb',
          alt: 'Example Image'
        }
      }
    ]
  }
}

export const CodeBlock: Story = {
  args: {
    jsonComponents: [
      {
        type: 'CodeBlock',
        inline: false,
        props: {
          code: rustCode,
          language: 'rust'
        },
        slots: {
          default: [
            {
              type: 'Text',
              inline: true,
              props: {
                text: 'File:'
              }
            },
            {
              type: 'Text',
              inline: true,
              props: {
                text: 'src/main.rs',
                code: true
              }
            }
          ]
        }
      }
    ]
  }
}

export const Katex: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Katex',
        inline: false,
        props: {
          expression:
            'i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left( -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}, t) \\right) \\Psi(\\mathbf{r}, t)'
        }
      }
    ]
  }
}

export const Table: Story = {
  args: {
    jsonComponents: [
      {
        type: 'Table',
        inline: false,
        slots: {
          header: [
            {
              type: 'TableRow',
              inline: false,
              slots: {
                default: [
                  {
                    type: 'TableCell',
                    inline: false,
                    slots: {
                      default: [
                        {
                          type: 'Text',
                          inline: true,
                          props: { text: 'Column A' }
                        }
                      ]
                    }
                  },
                  {
                    type: 'TableCell',
                    inline: false,
                    slots: {
                      default: [
                        {
                          type: 'Text',
                          inline: true,
                          props: { text: 'Column B' }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ],
          body: [
            {
              type: 'TableRow',
              inline: false,
              slots: {
                default: [
                  {
                    type: 'TableCell',
                    inline: false,
                    slots: {
                      default: [
                        {
                          type: 'Text',
                          inline: true,
                          props: { text: 'Column A Row 1' }
                        }
                      ]
                    }
                  },
                  {
                    type: 'TableCell',
                    inline: false,
                    slots: {
                      default: [
                        {
                          type: 'Text',
                          inline: true,
                          props: { text: 'Column B Row 1' }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              type: 'TableRow',
              inline: false,
              slots: {
                default: [
                  {
                    type: 'TableCell',
                    inline: false,
                    slots: {
                      default: [
                        {
                          type: 'Text',
                          inline: true,
                          props: { text: 'Column A Row 2' }
                        }
                      ]
                    }
                  },
                  {
                    type: 'TableCell',
                    inline: false,
                    slots: {
                      default: [
                        {
                          type: 'Text',
                          inline: true,
                          props: { text: 'Column B Row 2' }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
