import type { Meta, StoryObj } from '@storybook/vue3'
import ElmStatusMessage from './ElmStatusMessage.vue'

const meta: Meta<typeof ElmStatusMessage> = {
  title: 'Components/Data/ElmStatusMessage',
  component: ElmStatusMessage,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    status: {
      options: ['pending', 'success', 'error', 'warning'],
      control: 'radio'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    status: 'pending',
    message: 'This is a pending message'
  }
}

export const Success: Story = {
  args: {
    status: 'success',
    message: 'This is a success message'
  }
}

export const Error: Story = {
  args: {
    status: 'error',
    message: 'This is an error message'
  }
}

export const Warning: Story = {
  args: {
    status: 'warning',
    message: 'This is a warning message'
  }
}
