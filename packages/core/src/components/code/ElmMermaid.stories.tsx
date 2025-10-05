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

const flowchart = `
flowchart LR
    %% Node definitions
    Start([Start])
    Process1[Process Step]
    Decision{Decision Point}
    SubProcess[[Subroutine]]
    Database[(Database)]
    Document[/Document/]
    End([End])
    
    %% Subgraphs
    subgraph SG1["Main Flow"]
        direction TB
        Process1
        Decision
    end
    
    subgraph SG2["Data Layer"]
        direction LR
        Database
        Document
    end
    
    %% Links - Various styles
    Start --> Process1
    
    %% Normal arrow with label
    Process1 -->|Normal| Decision
    
    %% Thick link
    Decision ==>|YES| SubProcess
    
    %% Dotted link
    Decision -.->|NO| Database
    
    %% Bidirectional arrow
    SubProcess <-->|Sync| Database
    
    %% Chain connection
    Database --> Document --> End
    
    %% Connection to subgraph
    Process1 -.-> SG2
    
    %% Markdown text
    Note["\`**Note:**
    *Important information*
    Multi-line text support\`"]
    
    Document --> Note
    Note -.-> End
`;

const sequenceDiagram = `
sequenceDiagram
    participant User
    participant Client
    participant AuthServer
    participant ResourceServer

    User->>Client: Initiate authorization
    activate Client
    Client->>AuthServer: Redirect to /authorize
    activate AuthServer
    AuthServer->>User: Show login page
    deactivate AuthServer
    User->>AuthServer: Login and consent
    activate AuthServer
    AuthServer->>Client: Redirect with authorization code
    deactivate AuthServer
    deactivate Client
    Client->>AuthServer: POST /token (exchange code)
    activate AuthServer
    AuthServer->>Client: access_token, refresh_token
    deactivate AuthServer

    loop Access protected resources
        Client->>ResourceServer: API request with access_token
        activate ResourceServer
        ResourceServer->>Client: Protected data
        deactivate ResourceServer
    end

    alt Access token expired
        Client->>AuthServer: POST /token (refresh_token)
        activate AuthServer
        AuthServer->>Client: new access_token
        deactivate AuthServer
    end
`;

export const Flowchart: Story = {
  args: { code: flowchart },
};

export const SequenceDiagram: Story = {
  args: { code: sequenceDiagram },
};
