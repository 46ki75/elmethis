import type { Meta, StoryObj } from '@storybook/vue3'
import ElmInlineText from './ElmInlineText.vue'

const meta: Meta<typeof ElmInlineText> = {
  title: 'Components/Inline/ElmInlineText',
  component: ElmInlineText,
  tags: ['autodocs'],
  argTypes: { color: { control: 'color' } },
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { text: 'Inline Text' }
}
