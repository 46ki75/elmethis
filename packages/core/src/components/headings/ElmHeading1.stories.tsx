import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading1 from './ElmHeading1.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmHeading1> = {
  title: 'Components/Headings/ElmHeading1',
  component: ElmHeading1,
  tags: ['autodocs'],
  args: {
    text: 'Heading 1'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Slot: Story = {
  render: (args) => {
    return {
      setup: () => ({ args }),
      components: { ElmHeading1, ElmInlineText },
      template: `
          <ElmHeading1 v-bind="args">
            <ElmInlineText text="This" color="crimson" /> is <ElmInlineText text="code" code /> !
          </ElmHeading1>
          `
    }
  }
}
