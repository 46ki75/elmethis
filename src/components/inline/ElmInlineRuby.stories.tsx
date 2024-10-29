import type { Meta, StoryObj } from '@storybook/vue3'
import ElmInlineRuby from './ElmInlineRuby.vue'

const meta: Meta<typeof ElmInlineRuby> = {
  title: 'Components/Inline/ElmInlineRuby',
  component: ElmInlineRuby,
  tags: ['autodocs'],
  argTypes: { color: { control: 'color' } },
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { text: '国際連合', ruby: 'こくさいれんごう' }
}
