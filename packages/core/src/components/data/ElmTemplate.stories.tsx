import type { Meta, StoryObj } from '@storybook/vue3'
import ElmProgress from './ElmProgress.vue'

const meta: Meta<typeof ElmProgress> = {
  title: 'Components/Data/ElmProgress',
  component: ElmProgress,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    value: 50
  }
}

export const WithBuffer: Story = {
  args: {
    value: 50,
    buffer: 70
  }
}
