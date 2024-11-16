import type { Meta, StoryObj } from '@storybook/vue3'
import ElmOpenApiSchemaObject from './ElmOpenApiSchemaObject.vue'

const meta: Meta<typeof ElmOpenApiSchemaObject> = {
  title: 'Components/OpenAPI/ElmOpenApiSchemaObject',
  component: ElmOpenApiSchemaObject,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    name: 'John Doe',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the user'
        },
        age: {
          type: 'number',
          description: 'The age of the user'
        },
        isAdult: {
          type: 'boolean',
          description: 'Is the user an adult'
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
            description: 'A tag of the user'
          },
          description: 'The tags of the user'
        }
      }
    }
  }
}
