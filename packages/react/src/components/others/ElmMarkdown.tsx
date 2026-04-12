import React from "react";
import { marked, type Token, type Tokens } from "marked";

import "@styles/global.css";
import styles from "./ElmMarkdown.module.css";

import { ElmInlineText } from "../typography/ElmInlineText";
import { ElmHeading } from "../typography/ElmHeading";
import { ElmParagraph } from "../typography/ElmParagraph";
import { ElmList } from "../typography/ElmList";
import { ElmBlockQuote } from "../typography/ElmBlockQuote";
import { ElmDivider } from "../typography/ElmDivider";
import { ElmImage } from "../media/ElmImage";
import { ElmCodeBlock } from "../code/ElmCodeBlock";
import { ElmTable } from "../table/ElmTable";
import { ElmTableHeader } from "../table/ElmTableHeader";
import { ElmTableBody } from "../table/ElmTableBody";
import { ElmTableRow } from "../table/ElmTableRow";
import { ElmTableCell } from "../table/ElmTableCell";

export interface ElmMarkdownProps {
  style?: React.CSSProperties;

  /**
   * The markdown string to render.
   */
  markdown: string;
}

const renderByToken = (tokens: Token[]): React.ReactNode[] => {
  const results: React.ReactNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "blockquote":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            <ElmBlockQuote key={results.length}>
              {renderByToken(token.tokens as Token[])}
            </ElmBlockQuote>,
          );
        }
        break;
      case "br":
        results.push(<br key={results.length} />);
        break;
      case "code":
        results.push(
          <ElmCodeBlock
            key={results.length}
            code={token.text.trim()}
            language={token.lang}
          />,
        );
        break;
      case "codespan":
        results.push(
          <ElmInlineText key={results.length} code={true}>
            {token.text}
          </ElmInlineText>,
        );
        break;
      case "def":
        // Link reference definitions (not rendered directly)
        break;
      case "del":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={results.length} strikethrough={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={results.length} strikethrough={true}>
              {token.text}
            </ElmInlineText>
          ),
        );
        break;
      case "em":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={results.length} italic={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={results.length} italic={true}>
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
            <ElmHeading key={results.length} level={level}>
              {renderByToken(token.tokens as Token[])}
            </ElmHeading>,
          );
        } else {
          results.push(
            <ElmHeading key={results.length} level={level} text={token.text} />,
          );
        }
        break;
      }
      case "hr":
        results.push(<ElmDivider key={results.length} />);
        break;
      case "html":
        // HTML token
        break;
      case "image":
        results.push(
          <ElmImage
            key={results.length}
            block={true}
            enableModal={true}
            src={token.href}
            alt={token.text}
          />,
        );
        break;
      case "link":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={results.length} href={token.href}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={results.length} href={token.href}>
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
          <ElmList
            key={results.length}
            listStyle={token.ordered ? "ordered" : "unordered"}
          >
            {listItems}
          </ElmList>,
        );
        break;
      }
      case "list_item":
        results.push(
          <li key={results.length}>
            {token.tokens && token.tokens.length !== 0
              ? renderByToken(token.tokens as Token[])
              : token.text}
          </li>,
        );
        break;
      case "paragraph":
        if (token.tokens && token.tokens.length !== 0) {
          results.push(
            <ElmParagraph key={results.length}>
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
            <ElmInlineText key={results.length} bold={true}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <ElmInlineText key={results.length} bold={true}>
              {token.text}
            </ElmInlineText>
          ),
        );
        break;
      case "table": {
        const renderTableCells = (
          cells: Tokens.TableCell[],
        ): React.ReactNode[] =>
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
          <ElmTable
            key={results.length}
            header={<ElmTableHeader>{headerRow}</ElmTableHeader>}
            body={<ElmTableBody>{bodyRows}</ElmTableBody>}
          />,
        );
        break;
      }
      case "text":
        results.push(
          token.tokens && token.tokens.length !== 0 ? (
            <ElmInlineText key={results.length}>
              {renderByToken(token.tokens as Token[])}
            </ElmInlineText>
          ) : (
            <React.Fragment key={results.length}>{token.text}</React.Fragment>
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

export const ElmMarkdown = ({ markdown, style }: ElmMarkdownProps) => {
  const tokens = marked.setOptions({ gfm: true }).lexer(markdown);
  const elements = renderByToken(tokens);

  return (
    <div className={styles["markdown-body"]} style={style}>
      {elements}
    </div>
  );
};
