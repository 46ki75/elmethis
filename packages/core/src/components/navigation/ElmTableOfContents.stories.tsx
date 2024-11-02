import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTableOfContents from './ElmTableOfContents.vue'

const meta: Meta<typeof ElmTableOfContents> = {
  title: 'Components/Navigation/ElmTableOfContents',
  component: ElmTableOfContents,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
