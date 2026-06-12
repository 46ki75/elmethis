import {
  memo,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
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

export interface ElmMarkdownProps extends ComponentPropsWithoutRef<"div"> {
  markdown: string;

  /**
   * Set to true when markdown is being streamed incrementally.
   * Keeps completed blocks stable and only re-renders the trailing block on each token.
   */
  isStreaming?: boolean;
}

const renderByToken = (tokens: Token[]): ReactNode[] => {
  const results: ReactNode[] = [];

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
        // HTML token - rendering raw HTML needs dangerouslySetInnerHTML
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
        const renderTableCells = (cells: Tokens.TableCell[]): ReactNode[] =>
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
          results.push(token.text);
        }
        break;
      default:
        // Generic or unknown token
        break;
    }
  }

  return results;
};

// Memoized so a referentially stable `tokens` array (the completed-block prefix
// preserved across streaming renders) short-circuits its re-render.
const ElmMarkdownStable = memo(({ tokens }: { tokens: Token[] }) => (
  <>{renderByToken(tokens)}</>
));
ElmMarkdownStable.displayName = "ElmMarkdownStable";

export const ElmMarkdown = ({
  className,
  markdown,
  isStreaming,
  ...rest
}: ElmMarkdownProps) => {
  const allTokens = useMemo(
    () => marked.setOptions({ gfm: true }).lexer(markdown) as Token[],
    [markdown],
  );

  const isStreamingActive = Boolean(isStreaming) && allTokens.length > 0;

  // While streaming, the trailing block is still being lexed token-by-token;
  // everything before it is complete and append-only, so it never mutates.
  const stableCount = isStreamingActive
    ? allTokens.length - 1
    : allTokens.length;
  const tailTokens = isStreamingActive ? allTokens.slice(-1) : [];

  // Key the stable slice so its identity only changes when it should re-render:
  //  - streaming: only when a new block completes (`stableCount` grows), so the
  //    memoized stable subtree is skipped while the tail grows.
  //  - non-streaming: whenever the markdown (hence `allTokens` identity) changes.
  // The deps array is always length 1, satisfying React's hook invariant.
  const stableKey = isStreamingActive ? stableCount : allTokens;
  const stableTokens = useMemo(
    () => allTokens.slice(0, stableCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stableKey],
  );

  return (
    <div className={clsx(styles["elm-markdown"], className)} {...rest}>
      <ElmMarkdownStable tokens={stableTokens} />
      {renderByToken(tailTokens)}
    </div>
  );
};
