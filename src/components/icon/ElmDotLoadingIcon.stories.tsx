import type { Meta, StoryObj } from '@storybook/vue3'
import ElmDotLoadingIcon from './ElmDotLoadingIcon.vue'
import { h } from 'vue'

const meta: Meta<typeof ElmDotLoadingIcon> = {
  title: 'Components/Icons/ElmDotLoadingIcon',
  component: ElmDotLoadingIcon,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {},
  render: (args) => h(ElmDotLoadingIcon, { ...args })
}
