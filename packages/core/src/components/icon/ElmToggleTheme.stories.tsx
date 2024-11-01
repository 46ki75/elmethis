import type { Meta, StoryObj } from '@storybook/vue3'
import ElmToggleTheme from './ElmToggleTheme.vue'

const meta: Meta<typeof ElmToggleTheme> = {
  title: 'Components/Icon/ElmToggleTheme',
  component: ElmToggleTheme,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {}
}
