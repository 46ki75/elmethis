import type { Meta, StoryObj } from '@storybook/vue3'
import ElmBlockQuote from './ElmBlockQuote.vue'
import ElmInlineText from '../inline/ElmInlineText.vue'

const meta: Meta<typeof ElmBlockQuote> = {
  title: 'Components/Typography/ElmBlockQuote',
  component: ElmBlockQuote,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

export const Primary: Story = {
  render: () => ({
    components: { ElmBlockQuote, ElmInlineText },
    template: `<ElmBlockQuote><p><ElmInlineText text="${lorem}" /></p></ElmBlockQuote>`
  })
}
