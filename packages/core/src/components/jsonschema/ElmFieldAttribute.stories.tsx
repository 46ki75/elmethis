import type { Meta, StoryObj } from '@storybook/vue3'
import ElmFieldAttribute from './ElmFieldAttribute.vue'

const meta: Meta<typeof ElmFieldAttribute> = {
  title: 'Components/JSONSchema/ElmFieldAttribute',
  component: ElmFieldAttribute,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    icon: 'tdesign:list',
    name: 'enum',
    content: `['admin', 'user']`
  }
}
