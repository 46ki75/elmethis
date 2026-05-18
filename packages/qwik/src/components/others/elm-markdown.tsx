import {
  component$,
  PropsOf,
  JSXOutput,
  useSignal,
  useTask$,
} from "@qwik.dev/core";
import { marked, type Token, type Tokens } from "marked";

import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmHeading } from "../typography/elm-heading";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmList } from "../typography/elm-list";
import { ElmBlockQuote } from "../typography/elm-block-quote";
import { ElmDivider } from "../typography/elm-divider";
import { ElmBlockImage } from "../media/elm-block-image";
import { ElmCodeBlock } from "../code/elm-code-block";
import { ElmTable } from "../table/elm-table";
import { ElmTableHeader } from "../table/elm-table-header";
import { ElmTableBody } from "../table/elm-table-body";
import { ElmTableRow } from "../table/elm-table-row";
import { ElmTableCell } from "../table/elm-table-cell";

import styles from "./elm-markdown.module.css";

export interface ElmMarkdownProps extends PropsOf<"div"> {
  markdown: string;

  /**
   * Set to true when markdown is being streamed incrementally.
   * Keeps completed blocks stable and only re-renders the trailing block on each token.
   */
  streaming?: boolean;
}

const renderByToken = (tokens: Token[]): JSXOutput[] => {
  const results: JSXOutput[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token.type) {
      case "blockquote":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            <ElmBlockQuote key={i}>
              {renderByToken(token.tokens as Token[])}
            </ElmBlockQuote>,
          );
        }
        break;
      case "br":
        results.push(<br key={i} />);
        break;
      case "code":
        results.push(
          <ElmCodeBlock
            key={i}
            code={token.text.trim()}
            language={token.lang}
          />,
        );
        break;
      case "codespan":
        results.push(
          <ElmInlineText key={i} code={true}>
            {token.text}
          </ElmInlineText>,
        );
        break;
      case "def":
        // Link reference definitions (usually not rendered directly)
        break;
      case "del":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={i} strikethrough={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={i} strikethrough={true}>
              {token.text}
            </ElmInlineText>
          ),
        );
        break;
      case "em":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={i} italic={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={i} italic={true}>
              {token.text}
            </ElmInlineText>
          ),
        );
        break;
      case "escape":
        // Escape token
        break;
      case "heading": {
        const level = token.depth as 1 | 2 | 3 | 4 | 5 | 6;
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            <ElmHeading key={i} level={level}>
              {renderByToken(token.tokens as Token[])}
            </ElmHeading>,
          );
        } else {
          results.push(<ElmHeading key={i} level={level} text={token.text} />);
        }
        break;
      }
      case "hr":
        results.push(<ElmDivider key={i} />);
        break;
      case "html":
        // HTML token - rendering raw HTML in Qwik needs dangerouslySetInnerHTML
        break;
      case "image":
        results.push(
          <ElmBlockImage
            key={i}
            enableModal={true}
            src={token.href}
            alt={token.text}
          />,
        );
        break;
      case "link":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={i} href={token.href}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={i} href={token.href}>
              {token.text}
            </ElmInlineText>
          ),
        );
        break;
      case "list": {
        const listItems = token.items.map(
          (item: Tokens.ListItem, index: number) => (
            <li key={index}>{renderByToken(item.tokens)}</li>
          ),
        );
        results.push(
          <ElmList key={i} listStyle={token.ordered ? "ordered" : "unordered"}>
            {listItems}
          </ElmList>,
        );
        break;
      }
      case "list_item":
        results.push(
          <li key={i}>
            {token.tokens && token.tokens.length !== 0
              ? renderByToken(token.tokens as Token[])
              : token.text}
          </li>,
        );
        break;
      case "paragraph":
        results.push(
          <ElmParagraph key={i}>
            {token.tokens && token.tokens.length !== 0
              ? renderByToken(token.tokens as Token[])
              : token.text}
          </ElmParagraph>,
        );
        break;
      case "space":
        break;
      case "strong":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={i} bold={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={i} bold={true}>
              {token.text}
            </ElmInlineText>
          ),
        );
        break;
      case "table": {
        const renderTableCells = (cells: Tokens.TableCell[]): JSXOutput[] =>
          cells.map((cell: Tokens.TableCell, index: number) => (
            <ElmTableCell key={index}>
              {renderByToken(cell.tokens)}
            </ElmTableCell>
          ));

        const headerRow = (
          <ElmTableRow>{renderTableCells(token.header)}</ElmTableRow>
        );

        const bodyRows = token.rows.map(
          (row: Tokens.TableCell[], index: number) => (
            <ElmTableRow key={index}>{renderTableCells(row)}</ElmTableRow>
          ),
        );

        results.push(
          <ElmTable key={i}>
            <ElmTableHeader>{headerRow}</ElmTableHeader>
            <ElmTableBody>{bodyRows}</ElmTableBody>
          </ElmTable>,
        );
        break;
      }
      case "text":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(...renderByToken(token.tokens as Token[]));
        } else {
          results.push(token.text as unknown as JSXOutput);
        }
        break;
      default:
        // Generic or unknown token
        break;
    }
  }

  return results;
};

const ElmMarkdownStable = component$<{ tokens: Token[] }>(({ tokens }) => (
  <>{renderByToken(tokens)}</>
));

export const ElmMarkdown = component$<ElmMarkdownProps>((props) => {
  const { class: className, markdown: _markdown, streaming: _streaming, ...rest } = props;
  const stableTokens = useSignal<Token[]>([]);
  const tailTokens = useSignal<Token[]>([]);

  useTask$(({ track }) => {
    const md = track(() => props.markdown);
    const allTokens = marked.setOptions({ gfm: true }).lexer(md) as Token[];

    if (props.streaming && allTokens.length > 0) {
      const newStable = allTokens.slice(0, -1);
      // Only replace stableTokens when a new complete block is added,
      // so ElmMarkdownStable skips re-renders between block boundaries.
      if (newStable.length !== stableTokens.value.length) {
        stableTokens.value = newStable;
      }
      tailTokens.value = allTokens.slice(-1);
    } else {
      stableTokens.value = allTokens;
      tailTokens.value = [];
    }
  });

  return (
    <div class={[styles["markdown-body"], className]} {...rest}>
      <ElmMarkdownStable tokens={stableTokens.value} />
      {renderByToken(tailTokens.value)}
    </div>
  );
});
