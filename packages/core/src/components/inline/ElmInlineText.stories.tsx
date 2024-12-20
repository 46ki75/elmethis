import type { Meta, StoryObj } from '@storybook/vue3'
import ElmInlineText from './ElmInlineText.vue'
import { opacify } from 'polished'

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

export const Background: Story = {
  args: { backgroundColor: opacify(-0.5, '#6987b8') }
}
