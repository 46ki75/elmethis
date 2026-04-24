import {
  $,
  component$,
  NoSerialize,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./useAgent.module.css";

import {
  BaseEvent,
  compactEvents,
  HttpAgent,
  Message,
  randomUUID,
  UserMessage,
} from "@ag-ui/client";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiInput } from "./elm-ag-ui-input";

async function sh256(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

export interface ToolDef<T extends z.ZodObject<z.ZodRawShape>> {
  description: string;
  schema: T;
  execute: (args: z.infer<T>) => unknown;
}

export type AnyToolDef = ToolDef<z.ZodObject<z.ZodRawShape>>;
export type ToolRegistry = Record<string, AnyToolDef>;

export function getToolDefinitions(registry: ToolRegistry) {
  return Object.entries(registry).map(([name, { description, schema }]) => ({
    name,
    description,
    parameters: zodToJsonSchema(schema) as {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    },
  }));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseAgentOptions {
  url: string;
  tools?: ToolRegistry;
  context?: {
    value: string;
    description: string;
  }[];
  headers?: Record<string, string> | undefined;

  autoAddContext?: boolean;
}

export function useAgent({
  url,
  tools,
  context,
  headers,
  autoAddContext = true,
}: UseAgentOptions) {
  const httpAgent = useSignal<NoSerialize<HttpAgent> | null>(null);
  const toolsRef = useSignal<NoSerialize<ToolRegistry>>(noSerialize(tools));

  const agentStateStore = useStore<{
    messages: Message[];
    events: BaseEvent[];
    context?: {
      value: string;
      description: string;
    }[];
    isRunning: boolean;
  }>({
    messages: [
      {
        id: "f625d6c3-043b-4661-b265-d88087e83886",
        role: "user",
        content: "what is AWS Bedrock AgentCore?",
      },
      {
        id: "ag-ui-client-context-8d25b26273cd99c3a4398db394d3a9df0c8943a3897aa9b8f13c6887657f8d43",
        role: "system",
        content:
          "## Context\n\n- Sat Apr 25 2026 03:11:28 GMT+0900 (Japan Standard Time): Current date and time\n- Nerima, Tokyo, Japan: Location information",
      },
      {
        id: "f22b33d7-ecf4-4a48-a286-b3658a5156eb",
        role: "assistant",
        toolCalls: [
          {
            id: "call_11aaa1f54dfe90b2",
            type: "function",
            function: {
              name: "aws_knowledge_aws___search_documentation",
              arguments:
                '{"search_phrase":"AWS Bedrock AgentCore","topics":["general","reference_documentation","current_awareness"],"limit":10}',
            },
          },
        ],
      },
      {
        id: "5e121fba-ed10-4c76-a59b-857f2a079aae",
        toolCallId: "call_11aaa1f54dfe90b2",
        role: "tool",
        content:
          '{"content":[{"type":"text","text":"{\\"content\\":{\\"result\\":[{\\"rank_order\\":1,\\"title\\":\\"Amazon Bedrock AgentCore- AWS\\",\\"context\\":\\"Amazon Bedrock AgentCore is a platform designed to help build, deploy, and operate effective agents at scale with enterprise-grade security and dynamic scaling. It offers services such as Runtime for serverless agent deployment, Gateway for connecting agents to tools and data, Policy for comprehensive control over agent actions, Memory for maintaining context across interactions, Identity for secure agent identity and access management, Evaluations for improving agent quality, and Observability for monitoring agent behavior.\\\\n\\\\nAgentCore provides faster time to value, flexibility, and security at scale. Its services include:\\\\n\\\\n1. Runtime: Offers serverless agent deployment, complete session isolation, support for low-latency conversations to 8-hour asynchronous workloads, and deployment with code upload or containers.\\\\n2. Gateway: Enables agents to connect to tools and data by converting APIs and Lambda functions into agent-compatible tools, connecting to existing MCP servers, and enabling intelligent tool discovery through semantic search.\\\\n3. Policy: Provides comprehensive control over agent actions with real-time enforcement, integrating with Gateway to intercept tool calls in real-time and helping agents stay within boundaries without slowing down.\\\\n4. Memory: Controls how agents remember and learn with industry-leading accuracy, maintaining context across interactions while building knowledge that improves performance over time.\\\\n5. Identity: Offers secure, scalable agent identity and access management, allowing agents to securely access AWS resources and third-party tools and services on behalf of users or by themselves with pre-authorized user consent.\\\\n6. Evaluations: Improves agent quality through continuous, real-time monitoring, sampling and scoring live interactions using built-in and custom evaluators to help improve agent performance and quality.\\\\n7. Observability: Monitors agent behavior through intuitive dashboards, providing operational insights powered by Amazon CloudWatch to trace, debug, and monitor agent performance, and integrating with monitoring tools via OpenTelemetry for issue detection and analysis.\\\\n8. Code Interpreter: Securely executes code across multiple languages, enabling agents to write and execute code in sandbox environments, enhancing accuracy and ability to solve complex tasks.\\\\n9. Browser: Offers a fast, secure, and serverless browser runtime for agents, empowering agents to interact with web applications and carry out web-based workflows with reduced CAPTCHA interruptions, and auto-scaling from zero to hundreds of sessions.\\\\n\\\\nLeading organizations like Ericsson, Thomson Reuters, Cox Automotive, and Amazon Devices are using AgentCore to accelerate their AI initiatives while maintaining enterprise-grade security and reliability. AgentCore is also compatible with other AWS services such as AWS Marketplace, Amazon Bedrock Agents, and Strands Agents\\",\\"url\\":\\"https://aws.amazon.com/bedrock/agentcore/\\"},{\\"rank_order\\":2,\\"title\\":\\"Amazon Bedrock AgentCore now available in preview - AWS\\",\\"context\\":\\"Amazon Bedrock AgentCore is a new preview service from AWS that enables developers to deploy and manage AI agents with enterprise-grade security, reliability, and scale. It offers modular and composable services, including AgentCore Runtime for session isolation and long-running workloads, AgentCore Memory for managing short-term and long-term memory, AgentCore Gateway for simplifying tool integration, AgentCore Browser Tool for secure web interaction, AgentCore Code Interpreter for secure code execution, and AgentCore Observability for real-time visibility into agent execution. AgentCore Identity allows integration with identity providers and secure access to AWS resources and third-party tools. The services are available in US East (N. Virginia), US West (Oregon), Asia Pacific (Sydney), and Europe (Frankfurt). Amazon Bedrock AgentCore eliminates the trade-off between open-source flexibility and enterprise-grade security by working with any model and open-source agent framework. For more information, visit the news blog and AgentCore documentation, and refer to the pricing page for pricing details\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2025/07/amazon-bedrock-agentcore-preview/\\"},{\\"rank_order\\":3,\\"title\\":\\"Amazon Bedrock AgentCore\\",\\"context\\":\\"Amazon Bedrock AgentCore is a component of the Amazon Bedrock security solution designed to help secure and manage EC2 instances. It provides automatic patching and configuration management for Linux-based instances. AgentCore communicates with the Amazon Bedrock console, which is a web-based management interface, to receive instructions and report status.\\\\n\\\\nAgentCore uses a multi-stage patching process to minimize downtime and reduce the risk of application failures. It first identifies the required patches, then downloads and verifies them, and finally applies them to the instances. AgentCore also supports custom patch baselines, allowing users to specify which patches to apply and in what order.\\\\n\\\\nConfiguration management is another key feature of AgentCore. It allows users to define desired configurations for their instances and automatically enforces them. AgentCore uses a declarative configuration model, where users define the desired state of their instances, and AgentCore ensures that state is maintained.\\\\n\\\\nAgentCore supports various Linux distributions, including Amazon Linux 1 and 2, CentOS, Debian, and Ubuntu. It also integrates with other AWS services, such as Amazon SNS for notifications and Amazon CloudWatch for monitoring.\\\\n\\\\nTo get started with AgentCore, users need to launch an EC2 instance with the Amazon Linux AMI and install the AgentCore agent. They can then use the Amazon Bedrock console to enroll the instance, configure patching and management policies, and monitor its status. AgentCore is available at no additional cost, and users pay only for the underlying EC2 instance and any associated data transfer or usage of other AWS services\\",\\"url\\":\\"https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/index.html\\"},{\\"rank_order\\":4,\\"title\\":\\"Get started with Amazon Bedrock AgentCore - Amazon Bedrock AgentCore\\",\\"context\\":\\"The document outlines a quickstart guide for getting started with Amazon Bedrock AgentCore, a service that allows users to build and deploy conversational AI agents using various frameworks and models. The guide covers two methods for creating agents: code-based and managed harness. The code-based method involves writing the agent loop in Python using a supported framework and deploying it to AgentCore Runtime, providing full control over orchestration logic. The managed harness method, a preview feature, allows users to declare the agent in a config file and have AgentCore run the loop for them, making it a faster route from idea to a running agent.\\\\n\\\\nPrerequisites for using AgentCore include Node.js 20 or later, npm, an AWS account with credentials, and Python 3.10 or later. Users can install the AgentCore CLI using npm and configure IAM permissions for making API calls and assuming CDK bootstrap roles.\\\\n\\\\nThe guide walks through the code-based flow, starting with installing the AgentCore CLI, creating a project using an interactive wizard, testing the agent locally, deploying it to AWS, and invoking the deployed agent. The project structure includes a main config file, `agentcore.json`, and the agent code in the `app/` directory.\\\\n\\\\nUsers can test their agent locally using the `agentcore dev` command, which creates a Python virtual environment, installs dependencies, starts a local server, and opens the agent inspector in a browser. The agent inspector allows users to chat with the agent, inspect traces, and browse project resources.\\\\n\\\\nTo deploy the agent, users run the `agentcore deploy` command, which packages the code, uses AWS CDK to provision resources, creates an AgentCore Runtime endpoint, and configures CloudWatch logging and observability. The first deploy takes longer due to CDK bootstrapping, but subsequent deploys are faster.\\\\n\\\\nUsers can add capabilities to their project using the `agentcore add` command, which manages resources in `agentcore.json`. Capabilities include memory, agents, gateways, credentials, evaluators, and various other features.\\\\n\\\\nThe document also mentions various deep dives for capabilities and AgentCore code samples, as well as supported AWS regions and the AgentCore harness, a config-based path to a running agent. Users can clean up their project by running `agentcore remove all` and following up with a `deploy` command to tear down resources\\",\\"url\\":\\"https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-get-started-cli.html\\"},{\\"rank_order\\":5,\\"title\\":\\"Amazon Bedrock AgentCore - AWS Prescriptive Guidance\\",\\"context\\":\\"Amazon Bedrock AgentCore is a platform designed to help build, deploy, and manage agents at scale using any framework, model, or protocol. It offers several key services, including a runtime for securely hosting and running agents, a memory system for retaining context, a gateway for simplifying tool development, an identity service for managing agent access, and built-in tools for enhancing development and testing. AgentCore is fully managed, extensible, and provides long-term and short-term memory, simplified tool development, secure and scalable infrastructure, integration with a wide range of tools, and comprehensive observability and monitoring. It is particularly suitable for organizations looking to move AI agents from proof of concept to production, especially those requiring stateful, conversational agents and complex task automation. The implementation approach includes deploying agents securely, enhancing them with persistent memory and simplified tool integration, and monitoring them in production. A real-world example is a large Latin American bank using AgentCore to provide customers with intuitive interactions, enhanced security, and greater automation while ensuring compliance with financial regulations\\",\\"url\\":\\"https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-frameworks/amazon-bedrock-agentcore.html\\"},{\\"rank_order\\":6,\\"title\\":\\"Understand the available interfaces for using Amazon Bedrock AgentCore - Amazon Bedrock AgentCore\\",\\"context\\":\\"Amazon Bedrock AgentCore offers various interfaces for developing and deploying agent code. The simplest approach is to use the AgentCore Python SDK for coding and the AgentCore CLI for deployment. The document discusses five interfaces: AgentCore CLI, AgentCore Python SDK, Amazon Bedrock AgentCore MCP server, AWS SDK, and Amazon Bedrock AgentCore console.\\\\n\\\\nThe AgentCore CLI is a Node.js command-line tool for creating, configuring, deploying, and managing agents. It uses AWS CDK constructs and provides key commands like _agentcore create_, _agentcore deploy_, _agentcore dev_, _agentcore invoke_, and _agentcore status_. Configuration is managed through JSON files.\\\\n\\\\nThe AgentCore Python SDK provides Python primitives for agent development, supporting runtime, memory, tools, identity, and AgentCore Evaluations. It works with multiple frameworks and integrates with the AWS SDK for additional functionality.\\\\n\\\\nThe Amazon Bedrock AgentCore MCP server simplifies moving from local development to production deployment on AgentCore services, with built-in support for runtime integration, gateway connectivity, and agent lifecycle management. It works with popular MCP clients.\\\\n\\\\nThe AWS SDK can be used to interact with other AWS services and achieve the same results as the AgentCore Python SDK. It\'s necessary when not using Python as the coding language and for tasks not supported by the AgentCore Python SDK.\\\\n\\\\nThe Amazon Bedrock AgentCore console can be used to create and manage AgentCore services, test agents, and get code snippets. The AWS Command Line Interface can be used with AgentCore services for creating, managing, and performing runtime actions\\",\\"url\\":\\"https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/develop-agents.html\\"},{\\"rank_order\\":7,\\"title\\":\\"Amazon Bedrock AgentCore adds new features to help developers build agents faster - AWS\\",\\"context\\":\\"Amazon Bedrock AgentCore has introduced new features aimed at helping developers build agents faster. These features include a managed harness (in preview), the AgentCore CLI, and AgentCore skills for coding assistants. The managed harness lets developers define an agent with a model, system prompt, and tools, and run it immediately without orchestration code. It manages the full agent loop and provides filesystem and shell access. The harness is model agnostic and allows configuration overrides. When developers need full control, they can export the harness orchestration in Strands-based code. Filesystem persistence (preview) externalizes local session state, allowing agents to suspend and resume. Developers can add evaluations for measuring quality, memory, or additional tools and skills. The AgentCore CLI deploys validated concepts with infrastructure-as-code governance and audibility. AWS CDK is supported, with Terraform coming soon. The CLI is optimized for coding assistant control and has pre-built skills for AgentCore guidance. AgentCore skills are available through Kiro Power, with support for Claude Code, Codex, and Cursor coming next week. The managed harness is available in four AWS Regions, and the CLI is available in 14 AWS Regions where AgentCore is available. There is no additional charge for the harness, CLI, or skills\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2026/04/agentcore-new-features-to-build-agents-faster/\\"},{\\"rank_order\\":8,\\"title\\":\\"AI Agents – Amazon Bedrock Agents – AWS\\",\\"context\\":\\"Amazon Bedrock Agents is a tool that enables the development of generative AI applications to automate multistep tasks by connecting with company systems, APIs, and data sources. Agents use foundation models (FMs) for reasoning, APIs, and data to complete tasks, freeing teams to focus on high-value work. Agents include features like multi-agent collaboration, retrieval augmented generation, orchestrate and execute, memory retention, and code interpretation.\\\\n\\\\nMulti-agent collaboration allows developers to build, deploy, and manage multiple specialized agents working together to address complex business workflows. Each agent focuses on specific tasks under the coordination of a supervisor agent, which breaks down intricate processes into manageable steps for precision and reliability.\\\\n\\\\nRetrieval augmented generation securely connects to data sources and augments user requests with relevant information to generate accurate responses. For example, an agent can look up information from a knowledge base to determine claims eligibility.\\\\n\\\\nOrchestrate and execute allows users to create an agent in just a few steps, accelerating the development of generative AI applications. Users select a model, write instructions, and the agent orchestrates and analyzes the task, breaking it down into logical sequences using the FM\'s reasoning abilities. Agents call necessary APIs to fulfill requests and determine if they can proceed or need more information.\\\\n\\\\nMemory retention allows agents to remember historical interactions, offering more personalized and seamless user experiences. This feature improves the accuracy of multistep tasks and provides improved recommendations and recall of prior context.\\\\n\\\\nCode interpretation supports the ability to dynamically generate and execute code in a secure environment, automating complex analytical queries. This capability addresses a wide range of sophisticated use cases, such as data analysis, data visualization, and mathematical problem solving.\\\\n\\\\nAmazon Bedrock AgentCore helps deploy and operate AI agents securely and at scale using any open-source framework and model. Users can learn more about AgentCore on the Amazon website. To get started, users can read blogs and guides on best practices for building robust generative AI applications with Amazon Bedrock Agents\\",\\"url\\":\\"https://aws.amazon.com/bedrock/agents/\\"},{\\"rank_order\\":9,\\"title\\":\\"AWS Partners Demonstrate Enterprise AI Agent Solutions with Amazon Bedrock AgentCore | AWS Partner Network (APN) Blog\\",\\"context\\":\\"AWS Partners have been utilizing Amazon Bedrock AgentCore since its general availability on October 13, 2025, to build and deploy enterprise AI agent solutions. AgentCore offers services for Runtime, Memory, Gateway, Identity, and Observability, enabling partners to focus on their applications without managing infrastructure. Three success stories illustrate the value partners are delivering to their customers.\\\\n\\\\nCloudZero, a FinOps solution provider, faced challenges scaling their AI-driven cloud cost optimization capabilities due to increasing complexity and high developer cognitive load. By implementing CloudZero Advisor on AgentCore Runtime, they orchestrated five specialized agents for cost analysis, achieving 5x faster response times and reducing developer cognitive load by 75%.\\\\n\\\\nCisco integrated Cisco Duo and Secure Access with AgentCore to create zero trust architectures for AI agents. This solution combines Cisco Duo for identity fabric and granular access policies, and Cisco Secure Access\'s MCP semantic inspection proxy for detecting threats and preventing data exfiltration.\\\\n\\\\nGenpact\'s riskCanvas® Data Explorer solution for Apex Fintech Solutions featured a sophisticated agent-to-agent communication system built on AgentCore Runtime and Observability. The implementation enabled financial crime analysts to process daily trades across millions of brokerage accounts through natural language interactions.\\\\n\\\\nPwC Australia is integrating strategic architecture AI agents within a major Australian bank\'s existing business processes using AgentCore Runtime and Gateway services. These agents automate complex architectural reviews and ensure alignment with the bank\'s governance framework.\\\\n\\\\nReply partnered with Totemia to develop an Offer Agent using Strands SDK and AgentCore Runtime. The solution fetches real-time offers and returns tailored recommendations, achieving 65% reduced search time, 40% increased bookings, and 25% conversion growth.\\\\n\\\\nThese success stories demonstrate how AWS Partners are delivering transformative value across industries using AgentCore. As enterprise demand for AI agents grows, AgentCore enables partners to rapidly scale production-ready solutions while maintaining enterprise-grade security and performance\\",\\"url\\":\\"https://aws.amazon.com/blogs/apn/aws-partners-demonstrate-enterprise-ai-agent-solutions-with-amazon-bedrock-agentcore/\\"},{\\"rank_order\\":10,\\"title\\":\\"Provide identity and credential management for agent applications with Amazon Bedrock AgentCore Identity - Amazon Bedrock AgentCore\\",\\"context\\":\\"Amazon Bedrock AgentCore Identity is a service designed for managing identities and credentials for AI agents and automated workloads. It offers secure authentication, authorization, and credential management, enabling agents to access AWS resources and third-party services while maintaining strict security controls and audit trails. The service is compatible with industry-standard workload identity patterns and integrates with Amazon Bedrock AgentCore for managing identities for Host agents, tools, and resources connected to the Gateway. Topics covered in the document include an overview of AgentCore Identity, getting started, using the console, managing workload identities, configuring inbound JWT authorizers, managing credential providers, provider setup and configuration, data protection, and tagging AgentCore Identity resources. The service provides performance optimization and natively integrates with Amazon Bedrock AgentCore for agent applications\\",\\"url\\":\\"https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html\\"}]}}"}],"isError":false}',
      },
      {
        id: "9dc4ff0b-a68f-442f-bd70-d26c857f7b48",
        role: "assistant",
        content:
          "Based on the AWS documentation search results, **Amazon Bedrock AgentCore** is a comprehensive platform designed to help build, deploy, and operate AI agents at scale with enterprise-grade security and dynamic scaling.\n\n## Key Overview\n\nAmazon Bedrock AgentCore is a platform that enables developers to deploy and manage AI agents using any framework, model, or protocol. It eliminates the trade-off between open-source flexibility and enterprise-grade security by working with any model and open-source agent framework.\n\n## Core Services\n\nAgentCore provides several modular services:\n\n1. **Runtime** - Serverless agent deployment with complete session isolation, supporting low-latency conversations to 8-hour asynchronous workloads\n\n2. **Gateway** - Converts APIs and Lambda functions into agent-compatible tools, connects to existing MCP servers, and enables intelligent tool discovery through semantic search\n\n3. **Policy** - Real-time enforcement to control agent actions and keep agents within boundaries without slowing down\n\n4. **Memory** - Maintains context across interactions while building knowledge that improves performance over time\n\n5. **Identity** - Secure, scalable agent identity and access management for accessing AWS resources and third-party tools\n\n6. **Evaluations** - Continuous, real-time monitoring to sample and score live interactions using built-in and custom evaluators\n\n7. **Observability** - Intuitive dashboards powered by Amazon CloudWatch for tracing, debugging, and monitoring agent performance\n\n8. **Code Interpreter** - Securely executes code across multiple languages in sandbox environments\n\n9. **Browser** - Serverless browser runtime for agents to interact with web applications with auto-scaling\n\n## Key Benefits\n\n- **Faster time to value** with deployment via code upload or containers\n- **Flexibility** to use any framework, model, or protocol\n- **Security at scale** with enterprise-grade protection\n- Compatible with **Amazon Bedrock Agents**, **Strands Agents**, and other AWS services\n\n## Availability\n\nAgentCore is generally available (as of October 13, 2025) and operates in multiple AWS regions including US East (N. Virginia), US West (Oregon), Asia Pacific (Sydney), and Europe (Frankfurt).\n\nLeading organizations like Ericsson, Thomson Reuters, Cox Automotive, and Amazon Devices are using AgentCore to accelerate their AI initiatives.\n\n<citations>\n- https://aws.amazon.com/bedrock/agentcore/\n- https://aws.amazon.com/about-aws/whats-new/2025/07/amazon-bedrock-agentcore-preview/\n- https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-frameworks/amazon-bedrock-agentcore.html\n</citations>",
      },
    ],
    events: [],
    context,
    isRunning: false,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!httpAgent.value) {
      httpAgent.value = noSerialize(new HttpAgent({ url, headers }));
      cleanup(() => {
        httpAgent.value = null;
      });
    }

    if (!httpAgent.value) return;

    let pendingToolMessages: Message[] = [];

    const subscription = httpAgent.value.subscribe({
      onRunInitialized() {
        agentStateStore.isRunning = true;
      },
      onEvent({ messages: newMessages, event }) {
        if (agentStateStore.messages.length < newMessages.length) {
          agentStateStore.messages.push(
            ...newMessages.slice(agentStateStore.messages.length),
          );
        }
        agentStateStore.events = compactEvents([
          ...agentStateStore.events,
          event,
        ]);
      },
      onTextMessageContentEvent({ event }) {
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "assistant",
        );
        if (msg) msg.content = (msg.content ?? "") + event.delta;
      },
      onToolCallArgsEvent({ event }) {
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "assistant",
        );
        const toolCall = msg?.toolCalls?.find(
          (tc) => tc.id === event.toolCallId,
        );
        if (toolCall) toolCall.function.arguments += event.delta;
      },
      async onToolCallEndEvent({ event, toolCallName }) {
        const registry: ToolRegistry = toolsRef.value ?? {};
        const tool = registry[toolCallName];
        if (!tool) return;
        const msg = agentStateStore.messages.findLast(
          (m) => m.role === "assistant",
        );
        const toolCall = msg?.toolCalls?.find(
          (tc) => tc.id === event.toolCallId,
        );
        const args = toolCall?.function.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};
        pendingToolMessages.push({
          id: randomUUID(),
          role: "tool",
          content: JSON.stringify(await tool.execute(args)),
          toolCallId: event.toolCallId,
        } as Message);
      },
      async onRunFinalized() {
        console.log(agentStateStore.messages);
        if (pendingToolMessages.length === 0 || !httpAgent.value) {
          agentStateStore.isRunning = false;
          return;
        }
        httpAgent.value.messages.push(...pendingToolMessages);
        pendingToolMessages = [];
        try {
          await httpAgent.value.runAgent({
            tools: getToolDefinitions(toolsRef.value ?? {}),
          });
        } catch {
          agentStateStore.isRunning = false;
        }
      },
    });

    cleanup(() => {
      subscription.unsubscribe();
    });
  });

  const send = $(async (content: string) => {
    if (!httpAgent.value) return;
    const userMessage: UserMessage = {
      id: randomUUID(),
      role: "user",
      content,
    };
    httpAgent.value.messages.push(userMessage);

    if (autoAddContext) {
      const hash = await sh256(JSON.stringify(agentStateStore.context));
      const id = `ag-ui-client-context-${hash}`;
      const contextSystemMessage: Message = {
        id,
        role: "system",
        content: `## Context\n\n${agentStateStore.context
          ?.map((c) => `- ${c.value}: ${c.description}`)
          .join("\n")}`,
      };
      const isContextFresh = httpAgent.value.messages.some((m) => m.id === id);
      if (!isContextFresh) {
        httpAgent.value.messages = httpAgent.value.messages.filter(
          (m) => m.id !== id,
        );
        httpAgent.value.messages.push(contextSystemMessage);
      }
    }

    try {
      await httpAgent.value.runAgent({
        tools: getToolDefinitions(toolsRef.value ?? {}),
        context: agentStateStore.context?.map(({ value, description }) => ({
          value,
          description,
        })),
      });
    } catch {
      agentStateStore.isRunning = false;
    }
  });

  const addTool = $((name: string, tool: AnyToolDef) => {
    toolsRef.value = noSerialize({ ...(toolsRef.value ?? {}), [name]: tool });
  });

  const abort = $(() => {
    httpAgent.value?.abortRun();
  });

  const AgentUI = component$<{ class?: string; style?: CSSProperties }>(
    ({ class: className, style }) => {
      const input = useSignal("");

      const onInput$ = $((_event: InputEvent, element: HTMLTextAreaElement) => {
        input.value = element.value;
      });

      const onSubmit$ = $((_event: Event, element: Element) => {
        if (input.value.trim() === "") return;
        send(input.value);
        input.value = "";
        const textarea = element.querySelector("textarea");
        if (textarea) textarea.value = "";
      });

      return (
        <div class={[styles["use-agent"], className]} style={style}>
          <div class={styles["messages"]}>
            <ElmAgUiMessageRenderer
              isRunning={agentStateStore.isRunning}
              messages={agentStateStore.messages}
            />
          </div>

          <div class={styles["agent-input"]}>
            <ElmAgUiInput
              onInput$={onInput$}
              onSubmit$={onSubmit$}
              onAbort$={abort}
              isRunning={agentStateStore.isRunning}
            />
          </div>
        </div>
      );
    },
  );

  const setContext = $(
    (newContext: { value: string; description: string }[]) => {
      agentStateStore.context = newContext;
    },
  );

  return {
    messages: agentStateStore.messages,
    events: agentStateStore.events,
    context: agentStateStore.context,
    setContext,
    send,
    addTool,
    abort,
    AgentUI,
  };
}
