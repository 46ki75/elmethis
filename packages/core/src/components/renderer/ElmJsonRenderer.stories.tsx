import type { Meta, StoryObj } from '@storybook/vue3'
import ElmJsonRenderer from './ElmJsonRenderer.vue'

import seed from './seed.json'

const meta: Meta<typeof ElmJsonRenderer> = {
  title: 'Components/Renderer/ElmJsonRenderer',
  component: ElmJsonRenderer,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    json: [
      {
        type: 'ElmInlineText',
        props: { text: 'Hello, ' },
        children: []
      },
      {
        type: 'ElmInlineText',
        props: { text: 'world!' },
        children: []
      },
      {
        type: 'ElmInlineText',
        props: { text: 'console.log(0)', code: true },
        children: []
      }
    ]
  }
}

export const InlineIcon: Story = {
  args: {
    json: [
      {
        type: 'ElmInlineText',
        props: { text: 'Rust: A language ' }
      },
      {
        type: 'ElmInlineIcon',
        props: {
          src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/800px-Rust_programming_language_black_logo.svg.png'
        }
      },
      {
        type: 'ElmInlineText',
        props: {
          text: ' empowering everyone to build reliable and efficient software.'
        }
      }
    ]
  }
}

export const Callout: Story = {
  args: {
    json: [
      {
        type: 'ElmCallout',
        props: { type: 'note' },
        children: [
          { type: 'ElmInlineText', props: { text: 'Hello, ' } },
          { type: 'ElmInlineText', props: { text: 'world!' } },
          {
            type: 'ElmInlineText',
            props: { text: 'console.log(0)', code: true }
          }
        ]
      }
    ]
  }
}

export const BulletedList: Story = {
  args: {
    json: [
      {
        type: 'ElmBulletedList',
        children: [
          {
            type: 'ElmListItem',
            children: [
              { type: 'ElmInlineText', props: { text: 'Hello, ' } },
              { type: 'ElmInlineText', props: { text: 'world!' } }
            ]
          },
          {
            type: 'ElmListItem',
            children: [
              {
                type: 'ElmInlineText',
                props: { text: 'console.log(0)', code: true }
              }
            ]
          }
        ]
      }
    ]
  }
}

export const NumberedList: Story = {
  args: {
    json: [
      {
        type: 'ElmNumberedList',
        children: [
          {
            type: 'ElmListItem',
            children: [
              { type: 'ElmInlineText', props: { text: 'Hello, ' } },
              { type: 'ElmInlineText', props: { text: 'world!' } }
            ]
          },
          {
            type: 'ElmListItem',
            children: [
              {
                type: 'ElmInlineText',
                props: { text: 'console.log(0)', code: true }
              }
            ]
          }
        ]
      }
    ]
  }
}

export const Blockquote: Story = {
  args: {
    json: [
      {
        type: 'ElmBlockQuote',
        children: [
          { type: 'ElmInlineText', props: { text: 'Hello, ' } },
          { type: 'ElmInlineText', props: { text: 'world!' } },
          {
            type: 'ElmInlineText',
            props: { text: 'console.log(0)', code: true }
          }
        ]
      }
    ]
  }
}

export const Divider: Story = {
  args: { json: [{ type: 'ElmDivider' }] }
}

export const Headings: Story = {
  args: {
    json: [1, 2, 3, 4, 5, 6].map((level) => ({
      type: 'ElmHeading',
      props: { text: 'Hello, world!', level: level as 1 | 2 | 3 | 4 | 5 | 6 }
    }))
  }
}

export const CodeBlock: Story = {
  args: {
    json: [
      {
        type: 'ElmCodeBlock',
        props: { code: 'console.log(0)', language: 'javascript' }
      }
    ]
  }
}

export const Paragraph: Story = {
  args: {
    json: [
      {
        type: 'ElmParagraph',
        children: [
          { type: 'ElmInlineText', props: { text: 'Hello, ' } },
          { type: 'ElmInlineText', props: { text: 'world!' } },
          {
            type: 'ElmInlineText',
            props: { text: 'console.log(0)', code: true }
          }
        ]
      }
    ]
  }
}

export const Table: Story = {
  args: {
    json: [
      {
        type: 'ElmTable',
        children: [
          {
            type: 'ElmTableHeader',
            children: [
              {
                type: 'ElmTableRow',
                children: [
                  {
                    type: 'ElmTableCell',
                    props: { hasHeader: true, text: 'Header 1' }
                  },
                  {
                    type: 'ElmTableCell',
                    props: { hasHeader: true, text: 'Header 2' }
                  }
                ]
              }
            ]
          },
          {
            type: 'ElmTableBody',
            children: [
              {
                type: 'ElmTableRow',
                children: [
                  {
                    type: 'ElmTableCell',
                    children: [
                      { type: 'ElmInlineText', props: { text: 'Hello' } }
                    ]
                  },
                  {
                    type: 'ElmTableCell',
                    children: [
                      { type: 'ElmInlineText', props: { text: 'world!' } }
                    ]
                  }
                ]
              },
              {
                type: 'ElmTableRow',
                children: [
                  {
                    type: 'ElmTableCell',
                    children: [
                      { type: 'ElmInlineText', props: { text: 'Hello' } }
                    ]
                  },
                  {
                    type: 'ElmTableCell',
                    children: [
                      { type: 'ElmInlineText', props: { text: 'world!' } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}

export const Katex: Story = {
  args: {
    json: [
      {
        type: 'ElmKatex',
        props: {
          expression: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
          block: true
        }
      }
    ]
  }
}

export const Image: Story = {
  args: {
    json: [
      {
        type: 'ElmImage',
        props: {
          src: 'https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb',
          alt: 'Placeholder image',
          enableModal: true
        }
      }
    ]
  }
}

export const Bookmark: Story = {
  args: {
    json: [
      {
        type: 'ElmBookmark',
        props: {
          title:
            'OGP Checker - Check images for X(Twitter) and Facebook sharing | Web ToolBox',
          description:
            'A tool to check OGP tags and OGP images for SNS shares for a given page in real time, accurately simulating X (formerly Twitter) and Facebook share images on both PC and mobile.',
          image:
            'https://web-toolbox.dev/__og-image__/static/en/tools/ogp-checker/og.png',
          url: 'https://web-toolbox.dev/en/tools/ogp-checker',
          createdAt: '2021-08-01',
          updatedAt: '2021-08-01'
        }
      }
    ]
  }
}

export const Full: Story = {
  args: {
    json: seed as any
  }
}
