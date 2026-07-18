import { createMemo, For, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { marked, type Token, type Tokens } from "marked";

import { ElmCodeBlock } from "../code/elm-code-block";
import { ElmBlockImage } from "../media/elm-block-image";
import { ElmTable } from "../table/elm-table";
import { ElmTableBody } from "../table/elm-table-body";
import { ElmTableCell } from "../table/elm-table-cell";
import { ElmTableHeader } from "../table/elm-table-header";
import { ElmTableRow } from "../table/elm-table-row";
import { ElmBlockQuote } from "../typography/elm-block-quote";
import { ElmDivider } from "../typography/elm-divider";
import { ElmHeading } from "../typography/elm-heading";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmList } from "../typography/elm-list";
import { ElmParagraph } from "../typography/elm-paragraph";
import styles from "./elm-markdown.module.css";

export interface ElmMarkdownProps extends JSX.HTMLAttributes<HTMLDivElement> {
  markdown: string;

  /** Keep completed blocks mounted while the trailing block is streamed. */
  isStreaming?: boolean;
}

interface TokenListProps {
  tokens: readonly Token[];
}

const TokenList = (props: TokenListProps) => (
  <For each={props.tokens}>{(token) => renderToken(token)}</For>
);

const tokenChildren = (token: Token): readonly Token[] =>
  "tokens" in token && Array.isArray(token.tokens) ? token.tokens : [];

const tokenText = (token: Token): string =>
  "text" in token && typeof token.text === "string" ? token.text : "";

const renderToken = (token: Token): JSX.Element => {
  const children = tokenChildren(token);
  const nested = () =>
    children.length > 0 ? <TokenList tokens={children} /> : tokenText(token);

  switch (token.type) {
    case "blockquote":
      return children.length > 0 ? (
        <ElmBlockQuote>
          <TokenList tokens={children} />
        </ElmBlockQuote>
      ) : undefined;
    case "br":
      return <br />;
    case "code":
      return (
        <ElmCodeBlock code={token.text.trim()} language={token.lang ?? "txt"} />
      );
    case "codespan":
      return <ElmInlineText code>{token.text}</ElmInlineText>;
    case "del":
      return <ElmInlineText strikethrough>{nested()}</ElmInlineText>;
    case "em":
      return <ElmInlineText italic>{nested()}</ElmInlineText>;
    case "escape":
      return token.text;
    case "heading":
      return (
        <ElmHeading level={token.depth as 1 | 2 | 3 | 4 | 5 | 6}>
          {nested()}
        </ElmHeading>
      );
    case "hr":
      return <ElmDivider />;
    case "html":
      return undefined;
    case "image":
      return <ElmBlockImage enableModal src={token.href} alt={token.text} />;
    case "link":
      return <ElmInlineText href={token.href}>{nested()}</ElmInlineText>;
    case "list":
      return (
        <ElmList listStyle={token.ordered ? "ordered" : "unordered"}>
          <For each={token.items}>
            {(item: Tokens.ListItem) => (
              <li>
                <TokenList tokens={item.tokens} />
              </li>
            )}
          </For>
        </ElmList>
      );
    case "list_item":
      return (
        <li>
          {children.length > 0 ? <TokenList tokens={children} /> : token.text}
        </li>
      );
    case "paragraph":
      return <ElmParagraph>{nested()}</ElmParagraph>;
    case "strong":
      return <ElmInlineText bold>{nested()}</ElmInlineText>;
    case "table":
      return (
        <ElmTable>
          <ElmTableHeader>
            <ElmTableRow>
              <For each={token.header}>
                {(cell: Tokens.TableCell) => (
                  <ElmTableCell>
                    <TokenList tokens={cell.tokens} />
                  </ElmTableCell>
                )}
              </For>
            </ElmTableRow>
          </ElmTableHeader>
          <ElmTableBody>
            <For each={token.rows}>
              {(row: Tokens.TableCell[]) => (
                <ElmTableRow>
                  <For each={row}>
                    {(cell: Tokens.TableCell) => (
                      <ElmTableCell>
                        <TokenList tokens={cell.tokens} />
                      </ElmTableCell>
                    )}
                  </For>
                </ElmTableRow>
              )}
            </For>
          </ElmTableBody>
        </ElmTable>
      );
    case "text":
      return nested();
    case "def":
    case "space":
    default:
      return undefined;
  }
};

export const ElmMarkdown = (props: ElmMarkdownProps) => {
  const [local, rest] = splitProps(props, ["class", "markdown", "isStreaming"]);
  let stableCache: Token[] = [];

  const tokenGroups = createMemo(() => {
    const markdown = local.markdown;
    const allTokens = marked.lexer(markdown, { gfm: true }) as Token[];
    const streaming = Boolean(local.isStreaming) && allTokens.length > 0;

    if (!streaming) {
      stableCache = allTokens;
      return { stable: allTokens, tail: [] as Token[] };
    }

    const parsedStable = allTokens.slice(0, -1);
    let prefixMatches = true;
    // For maps by token identity, so reuse the completed append-only prefix.
    const stable = parsedStable.map((token, index) => {
      const cached = stableCache[index];
      if (
        prefixMatches &&
        cached != null &&
        cached.type === token.type &&
        cached.raw === token.raw
      ) {
        return cached;
      }

      prefixMatches = false;
      return token;
    });

    stableCache = stable;
    return { stable, tail: allTokens.slice(-1) };
  });

  return (
    <div {...rest} class={clsx(styles["elm-markdown"], local.class)}>
      <For each={tokenGroups().stable}>{(token) => renderToken(token)}</For>
      <For each={tokenGroups().tail}>{(token) => renderToken(token)}</For>
    </div>
  );
};
