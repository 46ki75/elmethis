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
          {
            type: 'ElmInlineText',
            props: { text: 'Hello, ' }
          },
          {
            type: 'ElmInlineText',
            props: { text: 'world!' }
          },
          {
            type: 'ElmInlineCode',
            props: { code: 'console.log(0)' }
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
        props: {},
        children: [
          {
            type: 'ElmListItem',
            props: {},
            children: [
              {
                type: 'ElmInlineText',
                props: { text: 'Hello, ' }
              },
              {
                type: 'ElmInlineText',
                props: { text: 'world!' }
              }
            ]
          },
          {
            type: 'ElmListItem',
            props: {},
            children: [
              {
                type: 'ElmInlineCode',
                props: { code: 'console.log(0)' }
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
        props: {},
        children: [
          {
            type: 'ElmListItem',
            props: {},
            children: [
              {
                type: 'ElmInlineText',
                props: { text: 'Hello, ' }
              },
              {
                type: 'ElmInlineText',
                props: { text: 'world!' }
              }
            ]
          },
          {
            type: 'ElmListItem',
            props: {},
            children: [
              {
                type: 'ElmInlineCode',
                props: { code: 'console.log(0)' }
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
        props: {},
        children: [
          {
            type: 'ElmInlineText',
            props: { text: 'Hello, ' }
          },
          {
            type: 'ElmInlineText',
            props: { text: 'world!' }
          },
          {
            type: 'ElmInlineCode',
            props: { code: 'console.log(0)' }
          }
        ]
      }
    ]
  }
}
