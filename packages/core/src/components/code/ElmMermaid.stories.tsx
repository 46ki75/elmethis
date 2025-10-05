import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmMermaid from "./ElmMermaid.vue";

const meta: Meta<typeof ElmMermaid> = {
  title: "Components/Code/ElmMermaid",
  component: ElmMermaid,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const TD = `
graph TD
    A(Root Directory) --> B(Folder 1)
    A --> C(Folder 2)
    B --> D(File 1.txt)
    B --> E(File 2.txt)
    C --> F(Subfolder)
    F --> G(File 3.txt)
`;

const sequenceDiagram = `
sequenceDiagram
  participant Slack
  participant APIGW as Amazon API Gateway
  participant L1 as AWS Lambda Function (sync)
  participant L2 as AWS Lambda Function (async)

  Slack->>APIGW: Slash command
  activate APIGW
  APIGW->>L1: Invoke
  activate L1
  L1->>L1: Signature verification
  L1->>L2: Asynchronous invocation
  activate L2
  L2-->>L1: Invocation accepted
  L1-->>APIGW: Response
  deactivate L1
  APIGW-->>Slack: Response
  deactivate APIGW
  L2->>L2: Long-running task
  L2->>Slack: Return result (actually a request)<br/>POST \${response_url}
  Slack-->>L2: 
  deactivate L2
`;

export const Primary: Story = {
  args: { code: TD },
};

export const SequenceDiagram: Story = {
  args: { code: sequenceDiagram },
};
