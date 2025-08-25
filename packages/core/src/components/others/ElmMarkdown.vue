<template>
  <component :is="">
    <component :is="() => renderResult" />
  </component>
</template>

<script setup lang="ts">
import { marked, type Token, type Tokens } from "marked";
import { defineAsyncComponent, h, type VNode } from "vue";
import { ElmBlockFallback } from "../..";

export interface ElmMarkdownProps {
  markdown: string;
  tag?: keyof HTMLElementTagNameMap;
}

const props = withDefaults(defineProps<ElmMarkdownProps>(), {
  tag: "div",
});

const AsyncElmInlineText = defineAsyncComponent({
  loader: () => import("../typography/ElmInlineText.vue"),
});

const AsyncElmHeading = defineAsyncComponent({
  loader: () => import("../typography/ElmHeading.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmParagraph = defineAsyncComponent({
  loader: () => import("../typography/ElmParagraph.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmList = defineAsyncComponent({
  loader: () => import("../typography/ElmList.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmBlockQuote = defineAsyncComponent({
  loader: () => import("../typography/ElmBlockQuote.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmDivider = defineAsyncComponent({
  loader: () => import("../typography/ElmDivider.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmImage = defineAsyncComponent({
  loader: () => import("../media/ElmImage.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmCodeBlock = defineAsyncComponent({
  loader: () => import("../code/ElmCodeBlock.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTable = defineAsyncComponent({
  loader: () => import("../table/ElmTable.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableHeader = defineAsyncComponent({
  loader: () => import("../table/ElmTableHeader.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableBody = defineAsyncComponent({
  loader: () => import("../table/ElmTableBody.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableRow = defineAsyncComponent({
  loader: () => import("../table/ElmTableRow.vue"),
  loadingComponent: ElmBlockFallback,
});

const AsyncElmTableCell = defineAsyncComponent({
  loader: () => import("../table/ElmTableCell.vue"),
  loadingComponent: ElmBlockFallback,
});

const renderByToken = ({ tokens }: { tokens: Token[] }): VNode[] => {
  const results: VNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "blockquote":
        if (token.tokens != null && token.tokens.length !== 0) {
          results.push(
            h(
              AsyncElmBlockQuote,
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
          h(AsyncElmCodeBlock, {
            code: token.text.trim(),
            language: token.lang,
          })
        );
        break;
      case "codespan":
        results.push(h(AsyncElmInlineText, { text: token.text, code: true }));
        break;
      case "def":
        h("span", "aaa");
        // Link reference definitions
        break;
      case "del":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                AsyncElmInlineText,
                { strikethrough: true },
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(AsyncElmInlineText, { text: token.text, strikethrough: true })
        );
        break;
      case "em":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                AsyncElmInlineText,
                { italic: true },
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(AsyncElmInlineText, { text: token.text, italic: true })
        );
        break;
      case "escape":
        // Escape token
        break;
      case "heading":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            h(
              AsyncElmHeading,
              { level: token.depth },
              {
                default: () =>
                  renderByToken({ tokens: token.tokens as Token[] }),
              }
            )
          );
        } else {
          results.push(
            h(AsyncElmHeading, { level: token.depth, text: token.text })
          );
        }
        break;
      case "hr":
        results.push(h(AsyncElmDivider));
        break;
      case "html":
        // HTML token
        break;
      case "image":
        results.push(
          h(AsyncElmImage, {
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
            ? h(
                AsyncElmInlineText,
                { href: token.href },
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(AsyncElmInlineText, { text: token.text, href: token.href })
        );
        break;
      case "list":
        const listItems = token.items.map((item: any) =>
          h("li", {}, renderByToken({ tokens: item.tokens }))
        );
        results.push(
          h(
            AsyncElmList,
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
              AsyncElmParagraph,
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
                AsyncElmInlineText,
                { bold: true },
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(AsyncElmInlineText, { text: token.text, bold: true })
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
              AsyncElmTableCell,
              {},
              { default: () => renderByToken({ tokens: cell.tokens }) }
            )
          );

        const headerRow = h(
          AsyncElmTableRow,
          {},
          { default: () => renderTableCells({ cells: token.header }) }
        );

        const bodyRows = token.rows.map((row: Tokens.TableCell[]) =>
          h(
            AsyncElmTableRow,
            {},
            { default: () => renderTableCells({ cells: row }) }
          )
        );

        const table = h(
          AsyncElmTable,
          {},
          {
            header: () =>
              h(AsyncElmTableHeader, {}, { default: () => headerRow }),
            body: () => h(AsyncElmTableBody, {}, { default: () => bodyRows }),
          }
        );

        results.push(table);

        break;
      case "text":
        results.push(
          token.tokens != null && token.tokens.length !== 0
            ? h(
                AsyncElmInlineText,
                {},
                {
                  default: () =>
                    renderByToken({ tokens: token.tokens as Token[] }),
                }
              )
            : h(AsyncElmInlineText, { text: token.text })
        );
        break;
      default:
        // Generic or unknown token
        break;
    }
  }

  return results;
};

const render = ({ markdown }: { markdown: string }): VNode[] => {
  const tokens = marked.setOptions({ gfm: true }).lexer(markdown);

  return renderByToken({ tokens });
};

const renderResult = render({ markdown: props.markdown });
</script>

<style module lang="scss"></style>
