import type { Meta, StoryObj } from '@storybook/vue3'
import ElmBadge from './ElmBadge.vue'
import ElmInlineText from '../typography/ElmInlineText.vue'

const meta: Meta<typeof ElmBadge> = {
  title: 'Components/Badge/ElmBadge',
  component: ElmBadge,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    color: '#c56565'
  },
  render: (args) => ({
    setup() {
      return { args }
    },
    components: { ElmBadge, ElmInlineText },
    template: `<ElmBadge v-bind="args">
      <template #left>
        <span>Left</span>
      </template>

      <template #right>
        <ElmInlineText text="Right" />
      </template>
    </ElmBadge>`
  })
}
