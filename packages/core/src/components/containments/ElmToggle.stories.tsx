import type { Meta, StoryObj } from '@storybook/vue3'
import ElmToggle from './ElmToggle.vue'
import ElmInlineText from '../typography/ElmInlineText.vue'

const meta: Meta<typeof ElmToggle> = {
  title: 'Components/Containments/ElmToggle',
  component: ElmToggle,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmToggle, ElmInlineText },
    template:
      '<ElmToggle summary="Toggle Blocks" v-bind="args"><p><ElmInlineText text="Block Content" /></p></ElmToggle>',
    data: () => ({ value: false })
  })
}

export const InlineSummary: Story = {
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmToggle, ElmInlineText },
    template: `<ElmToggle v-bind="args">
      <template #summary>
        <ElmInlineText text="How to use " />
        <ElmInlineText text="console.table()" code />
        <ElmInlineText text="?" />
      </template>
      <p><ElmInlineText text="Block Content" /></p>
    </ElmToggle>`,
    data: () => ({ value: false })
  })
}
