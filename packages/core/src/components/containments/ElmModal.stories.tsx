import type { Meta, StoryObj } from '@storybook/vue3'
import ElmModal from './ElmModal.vue'
import { h } from 'vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmModal> = {
  title: 'Components/Containments/ElmModal',
  component: ElmModal,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: (args) =>
    h(
      ElmModal,
      { ...args },
      { default: () => h(ElmInlineText, { text: 'Hello world!' }) }
    )
}
