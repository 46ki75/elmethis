import type { Meta, StoryObj } from '@storybook/vue3'
import ElmOpenApiSchemaObjectType from './ElmOpenApiSchemaObjectType.vue'

const meta: Meta<typeof ElmOpenApiSchemaObjectType> = {
  title: 'Components/OpenAPI/ElmOpenApiSchemaObjectType',
  component: ElmOpenApiSchemaObjectType,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    type: {
      options: [
        'object',
        'array',
        'string',
        ,
        'number',
        'boolean',
        'integer',
        'null'
      ],
      control: { type: 'radio' }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    type: 'object',
    name: 'user'
  }
}
