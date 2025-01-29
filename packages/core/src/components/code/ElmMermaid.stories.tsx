import type { Meta, StoryObj } from '@storybook/vue3'
import ElmMermaid from './ElmMermaid.vue'

const meta: Meta<typeof ElmMermaid> = {
  title: 'Components/Code/ElmMermaid',
  component: ElmMermaid,
  tags: ['autodocs'],
  args: {}
}

export default meta
type Story = StoryObj<typeof meta>

export const GraphTd: Story = {
  args: {
    code: `
        graph TD
        A[Client] --> B[Load Balancer]
        B --> C[Server1]
        B --> D[Server2]
    `
  }
}

export const SequenceTd: Story = {
  args: {
    code: `
        sequenceDiagram
        Client->>Load Balancer: Request
        Load Balancer->>Server1: Request
        Server1-->>Load Balancer: Response
        Load Balancer-->>Client: Response
    `
  }
}
