import type { Meta, StoryObj } from '@storybook/vue3'
import ElmToggle from './ElmToggle.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmToggle> = {
  title: 'Components/Containments/ElmToggle',
  component: ElmToggle,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { ElmToggle, ElmInlineText },
    template:
      '<ElmToggle summary="Toggle Blocks"><p><ElmInlineText text="Block Content" /></p></ElmToggle>',
    data: () => ({ value: false })
  })
}
