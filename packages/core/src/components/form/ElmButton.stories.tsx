import type { Meta, StoryObj } from '@storybook/vue3'
import ElmButton from './ElmButton.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'

const meta: Meta<typeof ElmButton> = {
  title: 'Components/Form/ElmButton',
  component: ElmButton,
  tags: ['autodocs'],
  args: {},
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmButton, ElmInlineText },
    template: '<ElmButton v-bind="args">elm-button</ElmButton>'
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Block: Story = {
  args: { block: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmButton, ElmInlineText },
    template: '<ElmButton block>elm-button</ElmButton>'
  })
}

export const Loading: Story = {
  args: { loading: true, block: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmButton, ElmInlineText },
    template: '<ElmButton v-bind="args">elm-button</ElmButton>'
  })
}

export const Icon: Story = {
  args: { block: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmButton, PencilSquareIcon },
    template:
      '<ElmButton v-bind="args"><PencilSquareIcon style="width: 16px;" />elm-button</ElmButton>'
  })
}

export const Flex: Story = {
  args: { block: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmButton, PencilSquareIcon },
    template: `
        <div style="display: flex; gap: 1rem;">
          <ElmButton v-bind="args"><PencilSquareIcon style="width: 16px;" />elm-button</ElmButton>
          <ElmButton v-bind="args"><PencilSquareIcon style="width: 16px;" />elm-button</ElmButton>
        </div>
      `
  })
}

export const Disabled: Story = {
  args: { block: true, disabled: true }
}

export const WithPrimary: Story = {
  args: { block: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmButton, PencilSquareIcon },
    template: `
        <div style="display: flex; gap: 1rem;">
          <ElmButton v-bind="args" primary><PencilSquareIcon style="width: 16px;" />elm-button</ElmButton>
          <ElmButton v-bind="args"><PencilSquareIcon style="width: 16px;" />elm-button</ElmButton>
        </div>
      `
  })
}
