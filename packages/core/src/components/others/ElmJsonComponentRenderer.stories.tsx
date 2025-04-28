import type { Meta, StoryObj } from "@storybook/vue3";
import ElmJsonComponentRenderer from "./ElmJsonComponentRenderer.vue";
import type { Component, InlineComponent } from "jarkup-ts";

import file from "../../assets/vite.svg";
import rustCode from "../code/seed/main.rs?raw";

const meta: Meta<typeof ElmJsonComponentRenderer> = {
  title: "Components/Others/ElmJsonComponentRenderer",
  component: ElmJsonComponentRenderer,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const LOREM_IPSUM = `
Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
when an unknown printer took a galley of type and scrambled it to make a type 
specimen book. It has survived not only five centuries, but also the leap 
into electronic typesetting, remaining essentially unchanged. It was popularised 
in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
and more recently with desktop publishing software like Aldus PageMaker 
including versions of Lorem Ipsum.
`;

const INLINE_TEMPLATE: InlineComponent[] = [
  {
    type: "Text",
    props: {
      text: "Hello, ",
    },
  },
  {
    type: "Text",
    props: {
      text: "world",
      bold: true,
      color: "#6987b8",
    },
  },
  {
    type: "Text",
    props: {
      text: " !",
    },
  },
] as const;

export const Primary: Story = {
  args: {
    jsonComponents: [
      {
        type: "Paragraph",
        slots: {
          default: INLINE_TEMPLATE,
        },
      },
    ],
  },
};

export const InlineIcon: Story = {
  args: {
    jsonComponents: [
      {
        type: "Paragraph",
        slots: {
          default: [
            {
              type: "Text",
              props: {
                text: "I love",
              },
            },
            {
              type: "Icon",
              props: {
                src: "https://www.rust-lang.org/static/images/rust-logo-blk.svg",
              },
            },
            {
              type: "Text",
              props: {
                text: "Rust",
              },
            },
          ],
        },
      },
    ],
  },
};

export const InlineKatex: Story = {
  args: {
    jsonComponents: [
      {
        type: "Paragraph",
        slots: {
          default: [
            {
              type: "Text",
              props: {
                text: "Hello, ",
              },
            },
            {
              type: "Text",
              props: {
                text: "E = mc^2",
                katex: true,
              },
            },
            {
              type: "Text",
              props: {
                text: " !",
              },
            },
          ],
        },
      },
    ],
  },
};

export const Heading: Story = {
  args: {
    jsonComponents: [
      {
        type: "Heading",
        props: {
          level: 1,
        },
        slots: {
          default: INLINE_TEMPLATE,
        },
      },
    ],
  },
};

const LIST_TEMPLATE: (listStyle: "unordered" | "ordered") => Component[] = (
  listStyle,
) => [
  {
    type: "List",
    props: {
      listStyle,
    },
    slots: {
      default: [
        ...new Array(3).fill({
          type: "ListItem",
          slots: {
            default: [
              ...INLINE_TEMPLATE,
              {
                type: "List",
                props: {
                  listStyle,
                },
                slots: {
                  default: [
                    ...new Array(3).fill({
                      type: "ListItem",
                      slots: { default: INLINE_TEMPLATE },
                    }),
                  ],
                },
              },
            ],
          },
        }),
      ],
    },
  },
];

export const UnorderedList: Story = {
  args: {
    jsonComponents: LIST_TEMPLATE("unordered"),
  },
};

export const OrderedList: Story = {
  args: {
    jsonComponents: LIST_TEMPLATE("ordered"),
  },
};

export const BlockQuote: Story = {
  args: {
    jsonComponents: [
      {
        type: "BlockQuote",
        props: { cite: "https://www.lipsum.com/" },
        slots: {
          default: [
            {
              type: "Text",
              props: { text: LOREM_IPSUM },
            },
          ],
        },
      },
    ],
  },
};

export const Callout: Story = {
  args: {
    jsonComponents: [
      {
        type: "Callout",
        props: { type: "warning" },
        slots: {
          default: [
            {
              type: "Paragraph",
              slots: {
                default: [
                  {
                    type: "Text",
                    props: { text: LOREM_IPSUM },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
};

export const Divider: Story = {
  args: {
    jsonComponents: [
      {
        type: "Divider",
      },
    ],
  },
};

export const Toggle: Story = {
  args: {
    jsonComponents: [
      {
        type: "Toggle",
        slots: {
          default: [
            {
              type: "Paragraph",
              slots: {
                default: [
                  {
                    type: "Text",
                    props: { text: LOREM_IPSUM },
                  },
                ],
              },
            },
          ],
          summary: [
            {
              type: "Text",
              props: { text: "Hello, world !" },
            },
          ],
        },
      },
    ],
  },
};

export const Bookmark: Story = {
  args: {
    jsonComponents: [
      {
        type: "Bookmark",
        props: {
          url: "https://pnpm.io/",
          title: "	Fast, disk space efficient package manager | pnpm",
          description: "Fast, disk space efficient package manager",
          image: "https://pnpm.io/img/ogimage.png",
        },
      },
    ],
  },
};

export const File: Story = {
  args: {
    jsonComponents: [
      {
        type: "File",
        props: {
          src: file,
          name: "Example File",
        },
      },
    ],
  },
};

export const Image: Story = {
  args: {
    jsonComponents: [
      {
        type: "Image",
        props: {
          src: "https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
          alt: "Example Image",
        },
      },
    ],
  },
};

export const CodeBlock: Story = {
  args: {
    jsonComponents: [
      {
        type: "CodeBlock",
        props: {
          code: rustCode,
          language: "rust",
        },
        slots: {
          default: [
            {
              type: "Text",
              props: {
                text: "File:",
              },
            },
            {
              type: "Text",
              props: {
                text: "src/main.rs",
                code: true,
              },
            },
          ],
        },
      },
    ],
  },
};

export const Katex: Story = {
  args: {
    jsonComponents: [
      {
        type: "Katex",
        props: {
          expression:
            "i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left( -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}, t) \\right) \\Psi(\\mathbf{r}, t)",
        },
      },
    ],
  },
};

export const Table: Story = {
  args: {
    jsonComponents: [
      {
        type: "Table",
        props: { caption: "Example Table" },
        slots: {
          header: [
            {
              type: "TableRow",
              slots: {
                default: [
                  {
                    type: "TableCell",
                    slots: {
                      default: [
                        {
                          type: "Text",
                          props: { text: "Column A" },
                        },
                      ],
                    },
                  },
                  {
                    type: "TableCell",
                    slots: {
                      default: [
                        {
                          type: "Text",
                          props: { text: "Column B" },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          body: [
            {
              type: "TableRow",
              slots: {
                default: [
                  {
                    type: "TableCell",
                    slots: {
                      default: [
                        {
                          type: "Text",
                          props: { text: "Column A Row 1" },
                        },
                      ],
                    },
                  },
                  {
                    type: "TableCell",
                    slots: {
                      default: [
                        {
                          type: "Text",
                          props: { text: "Column B Row 1" },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              type: "TableRow",
              slots: {
                default: [
                  {
                    type: "TableCell",
                    slots: {
                      default: [
                        {
                          type: "Text",
                          props: { text: "Column A Row 2" },
                        },
                      ],
                    },
                  },
                  {
                    type: "TableCell",
                    slots: {
                      default: [
                        {
                          type: "Text",
                          props: { text: "Column B Row 2" },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
};
