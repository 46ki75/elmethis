import type { Meta, StoryObj } from '@storybook/vue3'
import ElmNotion from './ElmNotion.vue'

const meta: Meta<typeof ElmNotion> = {
  title: 'Components/Notion/ElmNotion',
  component: ElmNotion,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    id: '131a03d79b268054a43ece134d63ca4a',
    endpoint: 'http://localhost:3000'
  }
}
