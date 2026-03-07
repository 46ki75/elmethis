import {
  component$,
  CSSProperties,
  Fragment,
  JSXOutput,
} from "@builder.io/qwik";
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

import styles from "./elm-markdown.module.scss";

export interface ElmMarkdownProps {
  markdown: string;

  style?: CSSProperties;
}

const renderByToken = (tokens: Token[]): JSXOutput[] => {
  const results: JSXOutput[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "blockquote":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            <ElmBlockQuote>
              {renderByToken(token.tokens as Token[])}
            </ElmBlockQuote>,
          );
        }
        break;
      case "br":
        results.push(<br />);
        break;
      case "code":
        results.push(
          <ElmCodeBlock code={token.text.trim()} language={token.lang} />,
        );
        break;
      case "codespan":
        results.push(<ElmInlineText text={token.text} code={true} />);
        break;
      case "def":
        // Link reference definitions (usually not rendered directly)
        break;
      case "del":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText strikethrough={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText text={token.text} strikethrough={true} />
          ),
        );
        break;
      case "em":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText italic={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText text={token.text} italic={true} />
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
            <ElmHeading level={level}>
              {renderByToken(token.tokens as Token[])}
            </ElmHeading>,
          );
        } else {
          results.push(<ElmHeading level={level} text={token.text} />);
        }
        break;
      }
      case "hr":
        results.push(<ElmDivider />);
        break;
      case "html":
        // HTML token - rendering raw HTML in Qwik needs dangerouslySetInnerHTML
        break;
      case "image":
        results.push(
          <ElmBlockImage
            enableModal={true}
            src={token.href}
            alt={token.text}
          />,
        );
        break;
      case "link":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText href={token.href}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText text={token.text} href={token.href} />
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
          <ElmList listStyle={token.ordered ? "ordered" : "unordered"}>
            {listItems}
          </ElmList>,
        );
        break;
      }
      case "list_item":
        results.push(
          <li>
            {token.tokens && token.tokens.length !== 0
              ? renderByToken(token.tokens as Token[])
              : token.text}
          </li>,
        );
        break;
      case "paragraph":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            <ElmParagraph>
              {renderByToken(token.tokens as Token[])}
            </ElmParagraph>,
          );
        }
        break;
      case "space":
        break;
      case "strong":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText bold={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText text={token.text} bold={true} />
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
          <ElmTable>
            <ElmTableHeader q:slot="header">{headerRow}</ElmTableHeader>
            <ElmTableBody q:slot="body">{bodyRows}</ElmTableBody>
          </ElmTable>,
        );
        break;
      }
      case "text":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <Fragment>{token.text}</Fragment>
          ),
        );
        break;
      default:
        // Generic or unknown token
        break;
    }
  }

  return results;
};

export const ElmMarkdown = component$<ElmMarkdownProps>(({ markdown }) => {
  const tokens = marked.setOptions({ gfm: true }).lexer(markdown);
  const elements = renderByToken(tokens);

  return <div class={styles["markdown-body"]}>{elements}</div>;
});
