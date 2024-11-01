import type { Meta, StoryObj } from '@storybook/vue3'
import ElmInlineText from './ElmInlineText.vue'

const meta: Meta<typeof ElmInlineText> = {
  title: 'Components/Inline/ElmInlineText',
  component: ElmInlineText,
  tags: ['autodocs'],
  argTypes: { color: { control: 'color' } },
  args: { text: 'Inline Text' }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Colored: Story = {
  args: { color: '#b36472' }
}
