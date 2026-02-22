import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmMarkdown from "./ElmMarkdown.vue";

const meta: Meta<typeof ElmMarkdown> = {
  title: "Components/Others/ElmMarkdown",
  component: ElmMarkdown,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const MARKDOWN = `
[google]: https://www.google.com "Google検索"
[github]: https://github.com

- [Google][google]
- [GitHub][github]

# Main Heading (heading)

This is a **bold text** (strong) and this is *italic text* (em). You can also have ~~strikethrough text~~ (del) and \`inline code\` (codespan).

Here are nested inline combinations:
- **Bold text with *italic inside* it** (strong containing em)
- *Italic text with **bold inside** it* (em containing strong)
- **Bold with \`inline code\` inside** (strong containing codespan)
- *Italic with \`inline code\` inside* (em containing codespan)
- ~~Strikethrough with **bold inside** it~~ (del containing strong)
- ~~Strikethrough with *italic inside* it~~ (del containing em)
- ~~Strikethrough with \`inline code\` inside~~ (del containing codespan)
- ***Bold and italic combined*** (strong and em nested)
- **Bold with ~~strikethrough inside~~ it** (strong containing del)
- *Italic with ~~strikethrough inside~~ it* (em containing del)
- \`Code with **bold formatting** inside\` (codespan containing strong - note: this typically won't render as bold in most markdown parsers)

Complex nested examples:
- ***Bold italic with \`code\` inside*** (multiple nesting)
- **Bold with *italic and ~~strikethrough~~* inside** (deep nesting)
- ~~Strikethrough with ***bold italic*** inside~~ (complex nesting)

## Subheading Level 2 (heading)

Here's a regular paragraph (paragraph) with normal text (text). This paragraph contains multiple sentences to test the text token properly.

> This is a blockquote (blockquote)
> It can span multiple lines
> And contain other formatting like **bold** and *italic*

### Code Block (code)

\`\`\`javascript
function example() {
    return "This is a code block";
}
\`\`\`

### Lists (list and list_item)

**Unordered List:**
- First item (list_item)
- Second item with *italic* text (list_item)
- Third item with **bold** text (list_item)

**Ordered List:**
1. First numbered item (list_item)
2. Second numbered item (list_item)
3. Third numbered item (list_item)

### Links and Images (link and image)

Here's a [link to example.com](https://example.com) (link).

![Alt text for image](https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb)

### Table (table)

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Line Breaks and Horizontal Rules

This line has a manual line break here  
(br) and continues on the next line.

---

(hr - horizontal rule above)

### HTML and Escape Characters (html and escape)

<div>This is raw HTML</div> (html)

You can escape characters like \* and \_ (escape) to prevent markdown formatting.
`;

export const Primary: Story = {
  args: { markdown: MARKDOWN },
};

const codeMarkdown = `\`\`\`ts
function greet(name) {
    return "Hello, " + name + "!";
}
\`\`\`
\`\`\` rust
#[tokio::main]
async fn main() {
    println!("Hello, world!");
}
\`\`\`
\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`
`;

export const CodeBlock: Story = {
  args: { markdown: codeMarkdown },
};
