import type { Meta, StoryObj } from '@storybook/vue3'
import ElmJsonRenderer from './ElmJsonRenderer.vue'

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
        type: 'ElmInlineCode',
        props: { code: 'console.log(0)' },
        children: []
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
          { type: 'ElmInlineCode', props: { code: 'console.log(0)' } }
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
              { type: 'ElmInlineCode', props: { code: 'console.log(0)' } }
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
              { type: 'ElmInlineCode', props: { code: 'console.log(0)' } }
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
          { type: 'ElmInlineCode', props: { code: 'console.log(0)' } }
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
    json: [
      {
        type: 'ElmHeading1',
        props: { text: 'Hello, world!' }
      },
      {
        type: 'ElmHeading2',
        props: { text: 'Hello, world!' }
      },
      {
        type: 'ElmHeading3',
        props: { text: 'Hello, world!' }
      },
      {
        type: 'ElmHeading4',
        props: { text: 'Hello, world!' }
      },
      {
        type: 'ElmHeading5',
        props: { text: 'Hello, world!' }
      },
      {
        type: 'ElmHeading6',
        props: { text: 'Hello, world!' }
      }
    ]
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
          { type: 'ElmInlineCode', props: { code: 'console.log(0)' } }
        ]
      }
    ]
  }
}
