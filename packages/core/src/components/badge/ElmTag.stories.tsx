import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTag from './ElmTag.vue'
import { lighten } from 'polished'

const meta: Meta<typeof ElmTag> = {
  title: 'Components/badge/ElmTag',
  component: ElmTag,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    text: 'Primary',
    color: lighten(0.3, '#6987b8')
  }
}
