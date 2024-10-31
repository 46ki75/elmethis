import type { Meta, StoryObj } from '@storybook/vue3'
import ElmLanguageIcon from './ElmLanguageIcon.vue'

const meta: Meta<typeof ElmLanguageIcon> = {
  title: 'Components/Icon/ElmLanguageIcon',
  component: ElmLanguageIcon,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    language: {
      control: 'radio',
      options: ['rust', 'javascript']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { language: 'rust' }
}
