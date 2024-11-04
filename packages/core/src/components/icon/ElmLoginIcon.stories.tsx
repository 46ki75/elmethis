import type { Meta, StoryObj } from '@storybook/vue3'
import ElmLoginIcon from './ElmLoginIcon.vue'

const meta: Meta<typeof ElmLoginIcon> = {
  title: 'Components/Icon/ElmLoginIcon',
  component: ElmLoginIcon,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
