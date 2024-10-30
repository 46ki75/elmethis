import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading6 from './ElmHeading6.vue'

const meta: Meta<typeof ElmHeading6> = {
  title: 'Components/Headings/ElmHeading6',
  component: ElmHeading6,
  tags: ['autodocs'],
  args: { text: 'Heading 6' }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
