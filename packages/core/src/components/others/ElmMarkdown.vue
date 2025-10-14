<template>
  <div>
    <component v-for="component in components" :is="component" />
  </div>
</template>

<script setup lang="ts">
import { marked, type Token, type Tokens } from "marked";
import { h, watch, ref, type VNode, computed } from "vue";
import ElmInlineText from "../typography/ElmInlineText.vue";
import ElmHeading from "../typography/ElmHeading.vue";
import ElmParagraph from "../typography/ElmParagraph.vue";
import ElmList from "../typography/ElmList.vue";
import ElmBlockQuote from "../typography/ElmBlockQuote.vue";
import ElmDivider from "../typography/ElmDivider.vue";
import ElmImage from "../media/ElmImage.vue";
import ElmCodeBlock from "../code/ElmCodeBlock.vue";
import ElmTable from "../table/ElmTable.vue";
import ElmTableHeader from "../table/ElmTableHeader.vue";
import ElmTableBody from "../table/ElmTableBody.vue";
import ElmTableRow from "../table/ElmTableRow.vue";
import ElmTableCell from "../table/ElmTableCell.vue";

export interface ElmMarkdownProps {
  markdown: string;
}

const props = withDefaults(defineProps<ElmMarkdownProps>(), {});

const renderByToken = ({ tokens }: { tokens: Token[] }): VNode[] => {
  const results: VNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "blockquote":
        if (token.tokens != null && token.tokens.length !== 0) {
          results.push(
            h(
              ElmBlockQuote,
              {},
              {
                default: () =>
                  renderByToken({ tokens: token.tokens as Token[] }),
              }
            )
          );
        }
        break;
      case "br":
        results.push(h("br"));
        break;
      case "code":
        results.push(
          h(ElmCodeBlock, {
            code: token.text.trim(),
            language: token.lang,
          })
        );
        break;
      case "codespan":
        results.push(h(ElmInlineText, { text: token.text, code: true }));
        break;
      case "def":
        h("span", "aaa");
        // Link reference definitions
        break;
      case "del":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                ElmInlineText,
                { strikethrough: true },
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(ElmInlineText, { text: token.text, strikethrough: true })
        );
        break;
      case "em":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                ElmInlineText,
                { italic: true },
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(ElmInlineText, { text: token.text, italic: true })
        );
        break;
      case "escape":
        // Escape token
        break;
      case "heading":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            h(
              ElmHeading,
              { level: token.depth },
              {
                default: () =>
                  renderByToken({ tokens: token.tokens as Token[] }),
              }
            )
          );
        } else {
          results.push(h(ElmHeading, { level: token.depth, text: token.text }));
        }
        break;
      case "hr":
        results.push(h(ElmDivider));
        break;
      case "html":
        // HTML token
        break;
      case "image":
        results.push(
          h(ElmImage, {
            block: true,
            enableModal: true,
            src: token.href,
            alt: token.text,
          })
        );
        break;
      case "link":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(ElmInlineText, {
                text: token.text,
                href: token.href,
              })
            : h(ElmInlineText, { text: token.text, href: token.href })
        );
        break;
      case "list":
        const listItems = token.items.map((item: any) =>
          h("li", {}, renderByToken({ tokens: item.tokens }))
        );
        results.push(
          h(
            ElmList,
            {
              listStyle: token.ordered ? "ordered" : "unordered",
            },
            { default: () => listItems }
          )
        );
        break;
      case "list_item":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                "li",
                {},
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h("li", { text: token.text })
        );
        break;
      case "paragraph":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            h(
              ElmParagraph,
              {},
              {
                default: () =>
                  renderByToken({ tokens: token.tokens as Token[] }),
              }
            )
          );
        }
        break;
      case "space":
        break;
      case "strong":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                ElmInlineText,
                { bold: true },
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(ElmInlineText, { text: token.text, bold: true })
        );
        break;
      case "table":
        const renderTableCells = ({
          cells,
        }: {
          cells: Tokens.TableCell[];
        }): VNode[] =>
          cells.map((cell: Tokens.TableCell) =>
            h(
              ElmTableCell,
              {},
              { default: () => renderByToken({ tokens: cell.tokens }) }
            )
          );

        const headerRow = h(
          ElmTableRow,
          {},
          { default: () => renderTableCells({ cells: token.header }) }
        );

        const bodyRows = token.rows.map((row: Tokens.TableCell[]) =>
          h(
            ElmTableRow,
            {},
            { default: () => renderTableCells({ cells: row }) }
          )
        );

        const table = h(
          ElmTable,
          {},
          {
            header: () => h(ElmTableHeader, {}, { default: () => headerRow }),
            body: () => h(ElmTableBody, {}, { default: () => bodyRows }),
          }
        );

        results.push(table);

        break;
      case "text":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                ElmInlineText,
                {},
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(ElmInlineText, { text: token.text })
        );
        break;
      default:
        // Generic or unknown token
        break;
    }
  }

  return results;
};

const renderMarkdown = ({ markdown }: { markdown: string }): VNode[] => {
  const tokens = marked.setOptions({ gfm: true }).lexer(markdown);
  return renderByToken({ tokens });
};

const renderResult = ref<VNode[]>(renderMarkdown({ markdown: props.markdown }));

const components = computed(() => ({
  render: () => renderResult.value,
}));

watch(
  () => props.markdown,
  (md) => {
    if (md != null) renderResult.value = renderMarkdown({ markdown: md });
  }
);
</script>
