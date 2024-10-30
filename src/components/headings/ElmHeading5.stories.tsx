import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading5 from './ElmHeading5.vue'

const meta: Meta<typeof ElmHeading5> = {
  title: 'Components/Headings/ElmHeading5',
  component: ElmHeading5,
  tags: ['autodocs'],
  args: { text: 'Heading 5' }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
