import type { Meta, StoryObj } from '@storybook/vue3'
import ElmPrismHighlighter from './ElmPrismHighlighter.vue'

import rust from './seed/main.rs?raw'

const meta: Meta<typeof ElmPrismHighlighter> = {
  title: 'Components/Code/ElmPrismHighlighter',
  component: ElmPrismHighlighter,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { code: "const foo = 'bar'", language: 'javascript' }
}

export const Rust: Story = {
  args: { code: rust, language: 'rust' }
}
