import type { Meta, StoryObj } from '@storybook/vue3'
import ElmDotLoadingIcon from './ElmDotLoadingIcon.vue'

const meta: Meta<typeof ElmDotLoadingIcon> = {
  title: 'Components/Icon/ElmDotLoadingIcon',
  component: ElmDotLoadingIcon,
  tags: ['autodocs'],
  argTypes: { color: { control: 'color' } },
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
