import type { Meta, StoryObj } from '@storybook/vue3'
import ElmInlineCode from './ElmInlineCode.vue'

const meta: Meta<typeof ElmInlineCode> = {
  title: 'Components/Inline/ElmInlineCode',
  component: ElmInlineCode,
  tags: ['autodocs'],
  argTypes: { color: { control: 'color' } },
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { code: 'console.log(0)' }
}
