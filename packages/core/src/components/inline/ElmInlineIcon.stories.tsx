import type { Meta, StoryObj } from '@storybook/vue3'
import ElmInlineIcon from './ElmInlineIcon.vue'

const meta: Meta<typeof ElmInlineIcon> = {
  title: 'Components/Inline/ElmInlineIcon',
  component: ElmInlineIcon,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    src: 'https://rust-lang.org/logos/rust-logo-512x512.png'
  }
}
