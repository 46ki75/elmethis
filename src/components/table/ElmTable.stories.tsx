import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTable from './ElmTable.vue'

const meta: Meta<typeof ElmTable> = {
  title: 'Components/Table/ElmTable',
  component: ElmTable,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
