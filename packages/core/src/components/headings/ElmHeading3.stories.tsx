import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading3 from './ElmHeading3.vue'

const meta: Meta<typeof ElmHeading3> = {
  title: 'Components/Headings/ElmHeading3',
  component: ElmHeading3,
  tags: ['autodocs'],
  args: { text: 'Heading 3' }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
