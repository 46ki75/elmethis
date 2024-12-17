import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTextField from './ElmTextField.vue'

const meta: Meta<typeof ElmTextField> = {
  title: 'Components/Form/ElmTextField',
  component: ElmTextField,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    label: 'First Name',
    maxLength: 20
  }
}
