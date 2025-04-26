import type { Meta, StoryObj } from '@storybook/vue3'
import ElmJsonComponentRenderer from './ElmJsonComponentRenderer.vue'

const meta: Meta<typeof ElmJsonComponentRenderer> = {
  title: 'Components/others/ElmJsonComponentRenderer',
  component: ElmJsonComponentRenderer,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
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
                text: 'world',
                bold: true
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
                text: 'world',
                code: true
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
