import type { Meta, StoryObj } from '@storybook/vue3'
import ElmJsonSchema from './ElmJsonSchema.vue'

const meta: Meta<typeof ElmJsonSchema> = {
  title: 'Components/JSONSchema/ElmJsonSchema',
  component: ElmJsonSchema,
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
      description: 'A user object',
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
        marker: {
          type: 'null',
          description: 'A marker for the user'
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

export const Union: Story = {
  args: {
    name: 'John Doe',
    schema: {
      type: ['object', 'array'],
      description: 'A user object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the user'
        },
        age: {
          type: ['number', 'string'],
          description: 'The age of the user'
        }
      }
    }
  }
}
