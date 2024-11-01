import type { Meta, StoryObj } from '@storybook/vue3'
import ElmBreadcrumb from './ElmBreadcrumb.vue'

const meta: Meta<typeof ElmBreadcrumb> = {
  title: 'Components/Navigation/ElmBreadcrumb',
  component: ElmBreadcrumb,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    links: [
      { text: 'Home' },
      { text: 'Library' },
      { text: 'Data' },
      { text: 'Data' }
    ]
  }
}
