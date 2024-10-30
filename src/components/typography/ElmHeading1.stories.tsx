import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading1 from './ElmHeading1.vue'

const meta: Meta<typeof ElmHeading1> = {
  title: 'Components/Typography/ElmHeading1',
  component: ElmHeading1,
  tags: ['autodocs'],
  args: {
    text: 'Heading 1'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
