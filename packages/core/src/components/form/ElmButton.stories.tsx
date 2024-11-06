import type { Meta, StoryObj } from '@storybook/vue3'
import ElmButton from './ElmButton.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmButton> = {
  title: 'Components/Form/ElmButton',
  component: ElmButton,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { ElmButton, ElmInlineText },
    template: '<ElmButton>elm-button</ElmButton>'
  })
}

export const Block: Story = {
  render: () => ({
    components: { ElmButton, ElmInlineText },
    template: '<ElmButton block>elm-button</ElmButton>'
  })
}

export const Loading: Story = {
  render: () => ({
    components: { ElmButton, ElmInlineText },
    template: '<ElmButton block loading>elm-button</ElmButton>'
  })
}
