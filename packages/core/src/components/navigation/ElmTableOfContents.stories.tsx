import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmTableOfContents from "./ElmTableOfContents.vue";

const meta: Meta<typeof ElmTableOfContents> = {
  title: "Components/Navigation/ElmTableOfContents",
  component: ElmTableOfContents,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    headings: [
      {
        level: 1,
        text: "Introduction to Vue Components",
      },
      {
        level: 2,
        text: "Getting Started",
      },
      {
        level: 2,
        text: "Core Concepts",
      },
      {
        level: 3,
        text: "Reactive Properties",
      },
      {
        level: 3,
        text: "Lifecycle Hooks",
      },
      {
        level: 2,
        text: "Advanced Topics",
      },
      {
        level: 3,
        text: "State Management",
      },
      {
        level: 3,
        text: "Testing and Debugging",
      },
      {
        level: 1,
        text: "Conclusion",
      },
    ],
  },
};

export const Deep: Story = {
  args: {
    headings: [
      {
        level: 1,
        text: "JavaScript Fundamentals",
      },
      {
        level: 2,
        text: "Variables and Data Types",
      },
      {
        level: 3,
        text: "Primitive Data Types",
      },
      {
        level: 4,
        text: "Strings and Numbers",
      },
      {
        level: 5,
        text: "Special Cases",
      },
      {
        level: 6,
        text: "NaN and Infinity",
      },
      {
        level: 3,
        text: "Reference Data Types",
      },
      {
        level: 4,
        text: "Arrays and Objects",
      },
      {
        level: 5,
        text: "Object Properties",
      },
      {
        level: 6,
        text: "Accessing and Modifying Properties",
      },
      {
        level: 2,
        text: "Control Structures",
      },
      {
        level: 3,
        text: "Conditional Statements",
      },
      {
        level: 4,
        text: "If-Else Statements",
      },
      {
        level: 4,
        text: "Switch Statements",
      },
      {
        level: 5,
        text: "Best Practices",
      },
      {
        level: 2,
        text: "Functions",
      },
      {
        level: 3,
        text: "Function Declarations and Expressions",
      },
      {
        level: 4,
        text: "Arrow Functions",
      },
      {
        level: 5,
        text: "Scope and Closures",
      },
      {
        level: 6,
        text: "Practical Examples",
      },
    ],
  },
};
