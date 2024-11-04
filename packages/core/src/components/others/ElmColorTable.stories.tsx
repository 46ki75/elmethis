import type { Meta, StoryObj } from '@storybook/vue3'
import ElmColorTable from './ElmColorTable.vue'

const meta: Meta<typeof ElmColorTable> = {
  title: 'Components/Others/ElmColorTable',
  component: ElmColorTable,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
