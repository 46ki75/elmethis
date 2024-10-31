import type { Meta, StoryObj } from '@storybook/vue3'
import ElmPagetop from './ElmPagetop.vue'

const meta: Meta<typeof ElmPagetop> = {
  title: 'Components/Navigation/ElmPagetop',
  component: ElmPagetop,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    position: { control: 'radio', options: ['left', 'right'] }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: (args) => ({
    components: { ElmPagetop },
    setup() {
      return { args }
    },
    template:
      '<div :style="{ height: \'1000vh\' }"><ElmPagetop v-bind="args"/></div>'
  })
}
