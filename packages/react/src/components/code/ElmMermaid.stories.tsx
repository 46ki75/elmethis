import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmMermaid } from "./ElmMermaid";

const flowchartCode = `flowchart LR
  A[Start] --> B{Decision}
  B -->|Yes| C[Process]
  B -->|No| D[End]
  C --> D`;

const sequenceCode = `sequenceDiagram
  participant User
  participant Auth
  participant API
  User->>Auth: Login request
  Auth-->>User: Access token
  User->>API: Request with token
  API-->>User: Response`;

const meta: Meta<typeof ElmMermaid> = {
  title: "Components/Code/ElmMermaid",
  component: ElmMermaid,
  tags: ["autodocs"],
  args: {
    code: flowchartCode,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Flowchart: Story = {};

export const Sequence: Story = {
  args: {
    code: sequenceCode,
  },
};
