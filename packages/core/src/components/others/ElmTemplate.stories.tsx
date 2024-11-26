import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTyping from './ElmTyping.vue'

const meta: Meta<typeof ElmTyping> = {
  title: 'Components/others/ElmTyping',
  component: ElmTyping,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
