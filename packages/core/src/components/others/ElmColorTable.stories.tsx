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

export const Primary: Story = {
  args: {
    colors: [
      { name: 'crimson', code: '#c56565' },
      { name: 'amber', code: '#d48b70' },
      { name: 'gold', code: '#cdb57b' },
      { name: 'emerald', code: '#59b57c' },
      { name: 'blue', code: '#6987b8' },
      { name: 'purple', code: '#9771bd' },
      { name: 'pink', code: '#c9699e' },
      { name: 'slate', code: '#868e9c' }
    ]
  }
}
