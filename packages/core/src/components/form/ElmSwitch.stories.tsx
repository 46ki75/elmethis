import type { Meta, StoryObj } from '@storybook/vue3'
import ElmSwitch from './ElmSwitch.vue'

const meta: Meta<typeof ElmSwitch> = {
  title: 'Components/Form/ElmSwitch',
  component: ElmSwitch,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
