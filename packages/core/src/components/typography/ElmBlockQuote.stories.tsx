import type { Meta, StoryObj } from '@storybook/vue3'
import ElmBlockQuote from './ElmBlockQuote.vue'
import ElmInlineText from './ElmInlineText.vue'

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
  args: { cite: 'https://www.lipsum.com/' },
  render: (args) => ({
    setup() {
      return { args }
    },
    components: { ElmBlockQuote, ElmInlineText },
    template: `<ElmBlockQuote v-bind="args"><p><ElmInlineText text="${lorem}" /></p></ElmBlockQuote>`
  })
}
