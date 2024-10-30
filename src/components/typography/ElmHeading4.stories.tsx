import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading4 from './ElmHeading4.vue'

const meta: Meta<typeof ElmHeading4> = {
  title: 'Components/Typography/ElmHeading4',
  component: ElmHeading4,
  tags: ['autodocs'],
  args: { text: 'Heading 4' }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
