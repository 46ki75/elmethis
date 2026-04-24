import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiMessageRenderer,
  type ElmAgUiMessageRendererProps,
} from "./elm-ag-ui-message-renderer";

const meta: Meta<ElmAgUiMessageRendererProps> = {
  title: "Components/AG-UI/elm-ag-ui-message-renderer",
  component: ElmAgUiMessageRenderer,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiMessageRendererProps>;

export const UserTextMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-001",
        role: "user",
        content: "Hello! Can you help me understand how AG-UI works?",
      },
    ],
  },
};

const md = `# AG-UI Protocol

AG-UI is a standardized protocol for communication between AI agents and frontend applications. It enables seamless integration of AI capabilities into user interfaces, supporting features like:

- **Vendor-neutral**: Works with any LLM provider
- **Streaming support**: Real-time text and tool call updates
- **Multimodal**: Supports text, images, audio, and documents

\`\`\`typescript
const client = new AgUiClient({ endpoint: "/api/agent" });
\`\`\`
`;

export const AssistantMarkdownMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-002",
        role: "assistant",
        content: md,
      },
    ],
  },
};

async function* tokenStream(tokens: string[], delayMs: number) {
  for (const token of tokens) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    yield token;
  }
}

const StreamingWrapper = component$(() => {
  const content = useSignal("");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const aborted = { value: false };
    cleanup(() => {
      aborted.value = true;
    });

    (async () => {
      for await (const token of tokenStream(md.split(/(?<=\s)|(?=\s)/), 80)) {
        if (aborted.value) break;
        content.value += token;
      }
    })();
  });

  return (
    <ElmAgUiMessageRenderer
      messages={[
        { id: "msg-stream-001", role: "assistant", content: content.value },
      ]}
    />
  );
});

export const AssistantMarkdownMessageStreaming: Story = {
  render: () => <StreamingWrapper />,
};

export const Conversation: Story = {
  args: {
    messages: [
      {
        id: "msg-102",
        role: "user",
        content: "What is the capital of France?",
      },
      {
        id: "msg-103",
        role: "assistant",
        content: "The capital of France is **Paris**.",
      },
      {
        id: "msg-104",
        role: "user",
        content: "What about Germany?",
      },
      {
        id: "msg-105",
        role: "assistant",
        content: "The capital of Germany is **Berlin**.",
      },
    ],
  },
};

export const UserImageMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-201",
        role: "user",
        content: [
          {
            type: "text",
            text: "What do you see in this image?",
          },
          {
            type: "image",
            source: {
              type: "url",
              value: "https://placehold.co/400x300?text=Sample+Image",
            },
          },
        ],
      },
    ],
  },
};

export const AssistantWithToolCall: Story = {
  args: {
    messages: [
      {
        id: "msg-301",
        role: "user",
        content: "What is the weather in Tokyo?",
      },
      {
        id: "msg-302",
        role: "assistant",
        toolCalls: [
          {
            id: "call-001",
            type: "function",
            function: {
              name: "get_weather",
              arguments: JSON.stringify({ location: "Tokyo", unit: "celsius" }),
            },
          },
        ],
      },
      {
        id: "msg-304",
        role: "assistant",
        content:
          "The current weather in Tokyo is **22°C** and sunny with 60% humidity.",
      },
    ],
  },
};

export const Tools: Story = {
  args: {
    messages: [
      {
        id: "2fa6e2cf-3e45-4176-be19-e148c6542954",
        role: "user",
        content: "What is a new feature called Amazon S3 Files?",
      },
      {
        id: "0157437b-4595-4cab-a97c-14a0fe3df14b",
        role: "assistant",
        toolCalls: [
          {
            id: "call_af23ac11ffc44361a1238cdf",
            type: "function",
            function: {
              name: "aws_knowledge_aws___search_documentation",
              arguments:
                '{"search_phrase":"Amazon S3 Files new feature","topics":["current_awareness"],"limit":10}',
            },
          },
        ],
        content:
          "Based on the AWS documentation search results, here's what **Amazon S3 Files** is:\n\n## Overview\n\n**Amazon S3 Files** is a new AWS service that enables direct file system access to data stored in Amazon S3 buckets. It essentially lets you treat S3 buckets as traditional file systems, eliminating the need to manage separate file systems or duplicate data.\n\n## Key Features\n\n| Feature | Description |\n|---------|-------------|\n| **Built on Amazon EFS** | S3 Files is built using Amazon EFS infrastructure |\n| **Full file system semantics** | Provides complete file system semantics with low-latency performance |\n| **No data movement** | Data stays in S3 — no copying or moving required |\n| **Massive concurrency** | Supports simultaneous connections from thousands of compute resources |\n| **High throughput** | Provides up to multiple terabytes per second of aggregate read throughput |\n| **Smart caching** | Caches actively used data for low-latency access |\n| **Wide availability** | Generally available in **34 AWS Regions** |\n\n## Use Cases\n\n- **Analytics & Data Lakes** — Run file-based analytics workloads directly on S3 data\n- **Machine Learning** — ML teams can run data preparation workloads without duplicating or staging files\n- **Shared access** — Enable multiple compute resources to access the same data without data duplication\n- **Legacy applications** — File-based applications can run on S3 data with **no code changes**\n\n## Lambda Integration\n\nA related feature allows **AWS Lambda functions to mount S3 buckets as file systems** using S3 Files, enabling standard file operations without downloading data. This simplifies stateful workloads and is particularly valuable for AI/ML workloads.\n\n## Key Benefits\n\n1. **Eliminates data silos** — No need to choose between file and object storage\n2. **No synchronization complexities** — Maintains a view of objects and translates file system operations into S3 requests\n3. **Cost-effective** — Uses S3's durability and cost model without additional storage overhead\n\nThis service bridges the gap between traditional file-based applications and modern object storage, making it easier to modernize workflows without significant refactoring.",
      },
      {
        id: "8b9c5904-89cf-40e5-916c-3e0766960c60",
        toolCallId: "call_af23ac11ffc44361a1238cdf",
        role: "tool",
        content:
          '{"content":[{"type":"text","text":"{\\"content\\":{\\"result\\":[{\\"rank_order\\":1,\\"title\\":\\"Announcing Amazon S3 Files, making S3 buckets accessible as file systems - AWS\\",\\"context\\":\\"Amazon S3 Files is a new service that enables direct file system access to data stored in Amazon S3. This service eliminates the need for organizations to manage separate file systems and duplicate data to enable file-based tools and applications to work with S3 data. Built using Amazon EFS, S3 Files provides full file system semantics and low-latency performance without data leaving S3. It supports simultaneous connections from thousands of compute resources, enabling shared access across clusters without data duplication. S3 Files works with all data in S3 buckets, old and new, and provides up to multiple terabytes per second of aggregate read throughput. It caches actively used data for low-latency access and is now generally available in 34 AWS Regions. S3 Files eliminates data silos, synchronization complexities, and tradeoffs between file and object storage. It maintains a view of the objects in your bucket and translates file system operations into efficient S3 requests on your behalf. File-based applications can run on S3 data with no code changes, and ML teams can run data preparation workloads without duplicating or staging files first. S3 Files is designed for use with analytics data and data lakes, and supports simultaneous access through both file system and S3 APIs\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2026/04/amazon-s3-files/\\"},{\\"rank_order\\":2,\\"title\\":\\"Amazon S3 now provides AWS source region information in server access logs - AWS\\",\\"context\\":\\"Amazon S3 has updated its server access logs to include source region information. This new feature allows users to identify applications making cross-region requests, aiding in cost and performance optimization. The source region information appears at the end of each log entry with no additional configuration. Usage of this feature is set to roll out in all AWS Regions in the upcoming weeks at no extra cost. For more information on S3 server access logs and best practices, refer to the S3 User Guide\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2026/02/amazon-s3-source-region-information/\\"},{\\"rank_order\\":3,\\"title\\":\\"Amazon S3 Lifecycle pauses actions on objects that are unable to replicate - AWS\\",\\"context\\":\\"Amazon S3 Lifecycle has introduced a new feature that prevents expiration and transition actions on objects that have failed replication. This change is aimed at helping users coordinate replication configuration or permissions changes with actions defined in their lifecycle rules. Objects that fail to replicate due to incorrect permissions or replication configuration will no longer be expired or transitioned, even if they match a lifecycle rule. Users can correct the issue and use S3 Batch Replication to replicate the failed objects. Once successfully replicated, S3 Lifecycle will automatically process these objects according to the configured rules. This change applies to all existing and new S3 Lifecycle configurations across 37 AWS Regions, including AWS China and AWS GovCloud (US). The deployment is ongoing and expected to be completed in the coming days. For more information, visit the S3 Lifecycle documentation and S3 Replication troubleshooting documentation\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2026/03/s3-lifecycle-pauses-actions-on-objects/\\"},{\\"rank_order\\":4,\\"title\\":\\"AWS Lambda functions can now mount Amazon S3 buckets as file systems with S3 Files - AWS\\",\\"context\\":\\"AWS Lambda now supports Amazon S3 Files, allowing Lambda functions to mount Amazon S3 buckets as file systems and perform standard file operations without downloading data. This integration, built using Amazon EFS, offers the benefits of a file system with the scalability, durability, and cost-effectiveness of S3. Multiple Lambda functions can access the same S3 Files file system concurrently, eliminating the need for custom synchronization logic. S3 Files simplifies stateful workloads in Lambda by eliminating the overhead of downloading objects, uploading results, and managing ephemeral storage limits. This is particularly valuable for AI and machine learning workloads. To use S3 Files with Lambda, configure your function to mount an S3 bucket through various methods like the Lambda console, AWS CLI, AWS SDKs, AWS CloudFormation, or AWS Serverless Application Model. S3 Files is supported for Lambda functions not configured with a capacity provider and is available in all regions where both Lambda and S3 Files are available, with no additional charges beyond standard Lambda and S3 pricing\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2026/04/aws-lambda-amazon-s3/\\"},{\\"rank_order\\":5,\\"title\\":\\"Amazon S3 adds new bucket-level setting to standardize encryption types used in your buckets - AWS\\",\\"context\\":\\"Amazon S3 has introduced a new bucket-level setting that allows users to enforce server-side encryption types for all write requests to their buckets. This setting can be used to standardize encryption types and can be set using the PutBucketEncryption API. The new setting supports Amazon S3 managed server-side encryption (SSE-S3) and server-side encryption with AWS KMS keys (SSE-KMS), while disabling server-side encryption with customer-provided keys (SSE-C). This enhancement is available in all AWS Regions and can be configured using the AWS Management Console, SDK, API, or CLI. The new setting is intended to help users maintain consistent encryption practices across their buckets. For more information, users can refer to the AWS Storage Blog post or the S3 User Guide\'s FAQ on the default SSE-C setting for new S3 buckets\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-s3-bucket-level-standardize-encryption-types/\\"},{\\"rank_order\\":6,\\"title\\":\\"Amazon S3 increases the maximum object size to 50 TB - AWS\\",\\"context\\":\\"Amazon S3 raised the maximum object size limit from 5 TB to 50 TB, enabling the storage of larger files such as high-resolution videos, seismic data, and AI training datasets. This change applies to all S3 storage classes and is compatible with all S3 features. Users can optimize upload and download performance for large objects using the latest AWS Common Runtime (CRT) and S3 Transfer Manager in the AWS SDK. S3\'s storage management capabilities, including Lifecycle and Replication, can be applied to these objects. Amazon S3 supports 50 TB objects in all regions. For more information on working with large objects, consult the S3 User Guide\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/\\"},{\\"rank_order\\":7,\\"title\\":\\"Mountpoint for Amazon S3 now lets you automatically mount your S3 buckets using fstab - AWS\\",\\"context\\":\\"Amazon S3\'s Mountpoint now supports automatic mounting of S3 buckets on Amazon EC2 instances using the fstab file. This feature simplifies the process of defining a consistent mounting configuration that applies when the instance starts up and persists through reboots. Previously, users had to manually mount S3 buckets after every boot and validate mount options. With automatic bucket mounting, users can add Mountpoint for Amazon S3 configurations to the fstab file for automatic application upon instance start-up. The fstab file is commonly used by Linux system administrators to manage mount configurations centrally. Mountpoint for Amazon S3 is an open-source project backed by AWS support, providing 24/7 access to cloud support engineers for customers with AWS Business and Enterprise Support plans. To get started, users can visit the GitHub page and product overview page\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2025/05/mountpoint-amazon-s3-mount-buckets-fstab/\\"},{\\"rank_order\\":8,\\"title\\":\\"Amazon S3 now supports attribute-based access control - AWS\\",\\"context\\":\\"Amazon S3 has introduced Attribute-Based Access Control (ABAC) for S3 general purpose buckets. This feature allows the use of tags for access control in addition to cost allocation. With ABAC, users can manage permissions to data based on tags, reducing the need for frequent IAM or bucket policy updates. To enable ABAC, use the S3 PutBucketAbac API and manage tags through the S3 TagResource and UntagResource APIs. Users can also require specific tags during bucket creation to maintain consistent tagging standards. ABAC for S3 general purpose buckets is available in all AWS Regions at no additional cost via the AWS Management Console, S3 REST API, AWS CLI, AWS SDK, and AWS CloudFormation. For more information, read the blog or visit the S3 User Guide\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-s3-attribute-based-access-control/\\"},{\\"rank_order\\":9,\\"title\\":\\"Amazon S3 Metadata now supports existing objects and reduces price by up to 33% - AWS\\",\\"context\\":\\"Amazon S3 Metadata, a feature that creates and manages metadata for datasets in Amazon S3, now supports existing objects. Previously, it only supported new and updated objects. With this update, users can write SQL queries across metadata for any amount of S3 storage. S3 Metadata uses two Apache Iceberg tables: a journal table that records changes made to data in near real time, and a live inventory table that provides an up-to-date view of all objects in a bucket. Both tables are stored in an AWS-managed Iceberg table bucket and can be queried using standard SQL through services like Amazon Athena, Amazon EMR, DuckDB, and PyIceberg. The journal table price has been reduced by 33% to make real-time change tracking and backfilling more cost-effective for large datasets. Users also pay a small per-object fee to fill the live inventory tables with information about existing S3 datasets. S3 Metadata is currently available in US East (N. Virginia), US East (Ohio), and US West (Oregon). Users are charged a small fee for every change to the underlying dataset that is recorded in S3 Metadata journal tables. For more details on pricing, visit the Amazon S3 pricing page. To learn more and get started, visit the product page and documentation\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2025/07/amazon-s3-metadata-existing-objects-reduces-price/\\"},{\\"rank_order\\":10,\\"title\\":\\"Amazon S3 Metadata is now available in three additional AWS Regions - AWS\\",\\"context\\":\\"Amazon S3 Metadata, a feature that enables users to discover and understand their S3 data with automated and easily-queried metadata, is now available in three additional AWS Regions: Europe (Frankfurt), Europe (Ireland), and Asia Pacific (Tokyo). This expansion makes S3 Metadata generally available in six AWS Regions. S3 Metadata supports both system-defined metadata, such as size and source of the object, and custom metadata, which includes tags for annotating objects with additional information. The metadata is automatically populated for both new and existing objects, providing a comprehensive, queryable view of data. S3 Metadata helps with business analytics, real-time inference applications, and more. For pricing details, visit the S3 pricing page. To learn more, check out the product page, documentation, and AWS Storage Blog\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-s3-metadata-three-additional-regions/\\"}]}}"}],"isError":false}',
      },
    ],
  },
};
