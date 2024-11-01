import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading2 from './ElmHeading2.vue'

const meta: Meta<typeof ElmHeading2> = {
  title: 'Components/Headings/ElmHeading2',
  component: ElmHeading2,
  tags: ['autodocs'],
  args: { text: 'Heading 2' }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
