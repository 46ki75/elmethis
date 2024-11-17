import type { Meta, StoryObj } from '@storybook/vue3'
import ElmChildContainer from './ElmChildContainer.vue'

const meta: Meta<typeof ElmChildContainer> = {
  title: 'Components/JSONSchema/ElmChildContainer',
  component: ElmChildContainer,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    icon: 'uil:setting',
    text: 'property'
  },
  render: (args) => ({
    setup() {
      return { args }
    },
    components: { ElmChildContainer },
    template:
      '<ElmChildContainer v-bind="args">SOME CONTENTS</ElmChildContainer>'
  })
}
