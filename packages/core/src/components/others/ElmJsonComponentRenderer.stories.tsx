import type { Meta, StoryObj } from '@storybook/vue3'
import ElmJsonComponentRenderer from './ElmJsonComponentRenderer.vue'

const meta: Meta<typeof ElmJsonComponentRenderer> = {
  title: 'Components/others/ElmJsonComponentRenderer',
  component: ElmJsonComponentRenderer,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
