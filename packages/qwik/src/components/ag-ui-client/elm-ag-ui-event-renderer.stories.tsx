import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiEventRenderer,
  type ElmAgUiEventRendererProps,
} from "./elm-ag-ui-event-renderer";
import { BaseEvent } from "@ag-ui/client";

const meta: Meta<ElmAgUiEventRendererProps> = {
  title: "Components/AG-UI/elm-ag-ui-event-renderer",
  component: ElmAgUiEventRenderer,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiEventRendererProps>;

const events = [
  {
    type: "RUN_STARTED",
    threadId: "e56d84e9-27de-4990-8845-65b31d4d3516",
    runId: "175d8394-ce42-4604-b4ec-316a40c3c1b8",
  },
  {
    type: "TOOL_CALL_START",
    toolCallId: "call_hdp3DwDDZQO8urEAxh2A47Vb",
    toolCallName: "aws_knowledge_aws___search_documentation",
    parentMessageId: "e78ca57e-9d8d-476a-aaf1-8c95415b2070",
  },
  {
    type: "TOOL_CALL_ARGS",
    toolCallId: "call_hdp3DwDDZQO8urEAxh2A47Vb",
    delta:
      '{"search_phrase":"new feature called Amazon S3 Files","topics":["current_awareness","general"],"limit":5}',
  },
  {
    type: "TOOL_CALL_END",
    toolCallId: "call_hdp3DwDDZQO8urEAxh2A47Vb",
  },
  {
    type: "TOOL_CALL_RESULT",
    messageId: "b18b4feb-b7a6-4cb6-84f2-370ae05650e3",
    toolCallId: "call_hdp3DwDDZQO8urEAxh2A47Vb",
    content:
      '{"content":[{"type":"text","text":"{\\"content\\":{\\"result\\":[{\\"rank_order\\":1,\\"title\\":\\"Announcing Amazon S3 Files, making S3 buckets accessible as file systems - AWS\\",\\"context\\":\\"Amazon S3 Files is a new service that enables direct file system access to data stored in Amazon S3. This service eliminates the need for organizations to manage separate file systems and duplicate data to enable file-based tools and applications to work with S3 data. Built using Amazon EFS, S3 Files provides full file system semantics and low-latency performance without data leaving S3. It supports simultaneous connections from thousands of compute resources, enabling shared access across clusters without data duplication. S3 Files works with all data in S3 buckets, old and new, and provides up to multiple terabytes per second of aggregate read throughput. It caches actively used data for low-latency access and is now generally available in 34 AWS Regions. S3 Files eliminates data silos, synchronization complexities, and tradeoffs between file and object storage. It maintains a view of the objects in your bucket and translates file system operations into efficient S3 requests on your behalf. File-based applications can run on S3 data with no code changes, and ML teams can run data preparation workloads without duplicating or staging files first. S3 Files is designed for use with analytics data and data lakes, and supports simultaneous access through both file system and S3 APIs\\",\\"url\\":\\"https://aws.amazon.com/about-aws/whats-new/2026/04/amazon-s3-files/\\"},{\\"rank_order\\":2,\\"title\\":\\"Launching S3 Files, making S3 buckets accessible as file systems | AWS News Blog\\",\\"context\\":\\"Amazon S3 Files, a new service offered by Amazon Simple Storage Service (S3), enables users to access their S3 buckets as file systems. This eliminates the need to choose between the cost, durability, and services that can natively consume data from S3 or a file system\'s interactive capabilities. S3 Files supports NFS v4.1+ operations and can be attached to multiple compute resources, allowing for data sharing across clusters without duplication. It uses Amazon Elastic File System (EFS) and delivers sub-millisecond latencies for active data. Users can create an S3 file system, discover mount targets, and mount the file system on their EC2 instances using standard file operations. Changes made to files in the file system are automatically reflected in the S3 bucket. S3 Files integrates with AWS Identity and Access Management (IAM) for access control and encryption, and data is always encrypted in transit and at rest. It uses POSIX permissions and can be monitored using Amazon CloudWatch metrics and AWS CloudTrail. S3 Files is ideal for workloads where multiple compute resources need to read, write, and mutate data collaboratively. It is available in all commercial AWS Regions and users pay for the portion of data stored in their S3 file system, for small file read and all write operations to the file system, and for S3 requests during data synchronization between the file system and the S3 bucket\\",\\"url\\":\\"https://aws.amazon.com/blogs/aws/launching-s3-files-making-s3-buckets-accessible-as-file-systems/\\"},{\\"rank_order\\":3,\\"title\\":\\"Amazon S3 Files\\",\\"context\\":\\"Amazon S3 Files is a service that enables direct file system access to data stored in Amazon S3. It allows users to access their S3 data as files with full file system semantics, without the need to duplicate data or cycle it between object storage and file system storage. S3 Files is built using Amazon EFS and delivers low latencies for frequently accessed data while keeping costs proportional to what is actively being used. It works like a traditional file system, but its view of files and folders reflects what\'s in the S3 bucket. S3 Files is beneficial for turning S3 into a shared file system, running high-performance file workloads, storing data once and accessing it everywhere, and scaling elastically while paying only for what is being used. It offers features such as native file access to S3 data, collaboration across compute resources, cost-optimized performance, and object and file storage without compromise. Industries that can benefit from S3 Files include life sciences and healthcare, financial services, media and entertainment, and manufacturing and engineering. Use cases include building and running AI agents that work natively with S3 data, accelerating ML training and data preparation pipelines, running file-based workloads and applications directly on S3 data, and creating workspaces for teams to collaborate on S3 data. Companies like Bayer, Deloitte, Cloudsmith, Presidio, Snorkel AI, and Torc Robotics have reported improved operations and reduced infrastructure overhead by using S3 Files\\",\\"url\\":\\"https://aws.amazon.com/s3/features/files/\\"},{\\"rank_order\\":4,\\"title\\":\\"Working with Amazon S3 Files - Amazon Simple Storage Service\\",\\"context\\":\\"Amazon S3 Files is a shared file system that connects AWS compute resources directly to data in Amazon S3, providing fast, direct access to S3 data with full file system semantics and low-latency performance. It uses Amazon EFS technology and allows users to read, write, and organize data using file and directory operations while S3 Files manages synchronization between the bucket and file system. The high-performance storage layer within the file system stores actively used file data and metadata, with data being copied onto it when files are accessed and removed when not read within a configurable expiration window. S3 Files automatically keeps the file system and S3 bucket consistent in both directions through synchronization. It delivers low-latency file access by copying only the active working set onto the high-performance storage and streaming large reads directly from S3. S3 Files supports NFS version 4.2 and 4.1 protocols, provides file system semantics, and encrypts all data in transit and at rest. Users are billed for the fraction of active data on the high-performance storage and file system access charges for reading from and writing to the file system. Supported compute services for mounting S3 file systems include Amazon EC2, AWS Lambda, Amazon EKS, and Amazon ECS. S3 Files is metered based on storage usage and file system access charges\\",\\"url\\":\\"https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-files.html\\"},{\\"rank_order\\":5,\\"title\\":\\"Configuring S3 Files for Amazon ECS - Amazon Elastic Container Service\\",\\"context\\":\\"Amazon S3 Files is a shared file system that connects AWS compute resources directly to data in Amazon S3, providing fast access with full file system semantics and low-latency performance. It is available for use with Amazon ECS on Fargate and Managed Instances launch types, but not on EC2. To configure an S3 file system for Amazon ECS, you need an S3 file system, a task IAM role, and VPC and security group configurations. The `s3filesVolumeConfiguration` object in the task definition includes parameters for the file system ARN, root directory, transit encryption port, and access point ARN. The file system uses mandatory transit encryption and a Task IAM Role. Prerequisites include an S3 file system, a Task IAM Role with specific permissions, and VPC and security group configurations. Optional access points can be used for application-specific access controls\\",\\"url\\":\\"https://docs.aws.amazon.com/AmazonECS/latest/developerguide/s3files-volumes.html\\"}]}}"}],"isError":false}',
    role: "tool",
  },
  {
    type: "TEXT_MESSAGE_START",
    messageId: "e78ca57e-9d8d-476a-aaf1-8c95415b2070",
    role: "assistant",
  },
  {
    type: "TEXT_MESSAGE_CONTENT",
    messageId: "e78ca57e-9d8d-476a-aaf1-8c95415b2070",
    delta:
      "**Amazon S3 Files** is a new Amazon S3 capability that lets you access the contents of an S3 bucket **as a file system** (e.g., via NFS), so file-based applications can read/write and use normal directories/files semantics **directly on data stored in S3**, without duplicating it to a separate filesystem.\n\nIt’s essentially “mount S3 like storage,” powered using **Amazon EFS** under the hood.",
  },
  {
    type: "TEXT_MESSAGE_END",
    messageId: "e78ca57e-9d8d-476a-aaf1-8c95415b2070",
  },
  {
    type: "RUN_FINISHED",
    threadId: "e56d84e9-27de-4990-8845-65b31d4d3516",
    runId: "175d8394-ce42-4604-b4ec-316a40c3c1b8",
  },
] as BaseEvent[];

export const Primary: Story = {
  args: { events },
};
