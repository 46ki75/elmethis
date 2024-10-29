import type { Meta, StoryObj } from '@storybook/vue3'
import ElmInlineLink from './ElmInlineLink.vue'

const meta: Meta<typeof ElmInlineLink> = {
  title: 'Components/Inline/ElmInlineLink',
  component: ElmInlineLink,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { text: 'elm-inline-link', href: 'https://example.com' }
}

export const OnClick: Story = {
  args: { text: 'Open Dialog', onClick: () => alert('clicked!') }
}

export const OpenInSameTab: Story = {
  args: {
    text: 'open in same tab',
    href: 'https://example.com',
    openInNewTab: false
  }
}
