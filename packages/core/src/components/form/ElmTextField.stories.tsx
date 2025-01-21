import type { Meta, StoryObj } from '@storybook/vue3'
import ElmTextField from './ElmTextField.vue'
import { Icon } from '@iconify/vue/dist/iconify.js'
import { h } from 'vue'

const meta: Meta<typeof ElmTextField> = {
  title: 'Components/Form/ElmTextField',
  component: ElmTextField,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    label: 'Email',
    maxLength: 20,
    suffix: '@46ki75.com',
    placeholder: 'Enter your email',
    icon: h(Icon, { icon: 'mdi:envelope-outline' })
  }
}
