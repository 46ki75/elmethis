import type { Meta, StoryObj } from '@storybook/vue3'
import ElmButton from './ElmButton.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'
import { Icon } from '@iconify/vue/dist/iconify.js'
import { h } from 'vue'

const meta: Meta<typeof ElmButton> = {
  title: 'Components/Form/ElmButton',
  component: ElmButton,
  tags: ['autodocs'],
  args: {},
  render: (args) => ({
    setup: () => ({
      args: { ...args, onClick: () => window.alert('clicked') }
    }),
    components: { ElmButton, ElmInlineText },
    template: '<ElmButton v-bind="args">elm-button</ElmButton>'
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Block: Story = {
  args: { block: true }
}

export const Loading: Story = {
  args: { loading: true, block: true }
}

export const Flex: Story = {
  args: { block: true },
  render: (args) => ({
    setup: () => ({ args }),
    components: {
      ElmButton,
      icon: h(Icon, { icon: 'mdi:library-edit', width: 16 })
    },
    template: `
        <div style="display: flex; gap: 1rem;">
          <ElmButton v-bind="args"><icon />elm-button</ElmButton>
          <ElmButton v-bind="args"><icon />elm-button</ElmButton>
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
    components: {
      ElmButton,
      icon: h(Icon, { icon: 'mdi:library-edit', width: 16 })
    },
    template: `
        <div style="display: flex; gap: 1rem;">
          <ElmButton v-bind="args" primary><icon />elm-button</ElmButton>
          <ElmButton v-bind="args"><icon />elm-button</ElmButton>
        </div>
      `
  })
}
