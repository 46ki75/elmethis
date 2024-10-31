import type { Meta, StoryObj } from '@storybook/vue3'
import ElmListItem from './ElmListItem.vue'

const meta: Meta<typeof ElmListItem> = {
  title: 'Components/Typography/ElmListItem',
  component: ElmListItem,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
