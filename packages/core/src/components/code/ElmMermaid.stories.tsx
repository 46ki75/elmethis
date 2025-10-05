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

export const Primary: Story = {
  args: { code: TD },
};

export const SequenceDiagram: Story = {
  args: { code: sequenceDiagram },
};
