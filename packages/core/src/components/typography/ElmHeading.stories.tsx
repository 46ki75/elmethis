import type { Meta, StoryObj } from '@storybook/vue3'
import ElmHeading from './ElmHeading.vue'
import ElmInlineText from './ElmInlineText.vue'

const meta: Meta<typeof ElmHeading> = {
  title: 'Components/Typography/ElmHeading',
  component: ElmHeading,
  tags: ['autodocs'],
  argTypes: {
    level: {
      options: [1, 2, 3, 4, 5, 6],
      control: 'radio'
    }
  },
  args: {
    text: 'Heading',
    level: 1
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Slot: Story = {
  render: (args) => {
    return {
      setup: () => ({ args }),
      components: { ElmHeading: ElmHeading, ElmInlineText },
      template: `
          <ElmHeading v-bind="args">
            <ElmInlineText text="This" color="crimson" /> is <ElmInlineText text="code" code /> !
          </ElmHeading>
          `
    }
  }
}
