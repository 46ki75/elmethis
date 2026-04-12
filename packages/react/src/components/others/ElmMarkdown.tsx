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
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmMarkdownCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmMarkdownProps {
  style?: React.CSSProperties & ElmMarkdownCSSVariables;

  /**
   * The markdown string to render.
   */
  markdown: string;

  renderFunctionMap?: Partial<RenderFunctionMapReact>;
}

type TokenTypeMap = {
  blockquote: Tokens.Blockquote;
  br: Tokens.Br;
  code: Tokens.Code;
  codespan: Tokens.Codespan;
  def: Tokens.Def;
  del: Tokens.Del;
  em: Tokens.Em;
  escape: Tokens.Escape;
  heading: Tokens.Heading;
  hr: Tokens.Hr;
  html: Tokens.HTML | Tokens.Tag;
  image: Tokens.Image;
  link: Tokens.Link;
  list: Tokens.List;
  list_item: Tokens.ListItem;
  paragraph: Tokens.Paragraph;
  space: Tokens.Space;
  strong: Tokens.Strong;
  table: Tokens.Table;
  text: Tokens.Text;
};

type RenderFunction<T extends keyof TokenTypeMap, N> = (
  token: TokenTypeMap[T],
  render: (tokens: Token[]) => React.ReactNode[],
  index: number,
) => N | null;

type RenderFunctionMap<N> = {
  [T in keyof TokenTypeMap]: RenderFunction<T, N>;
};

type RenderFunctionMapReact = RenderFunctionMap<React.ReactNode>;

const defaultRenderFunctionMap: RenderFunctionMapReact = {
  blockquote: (token, render, index) => {
    if (!token.tokens || token.tokens.length === 0) return null;
    const innerTokens = (token.tokens as Token[]).flatMap((t) =>
      t.type === "paragraph" && (t as Tokens.Paragraph).tokens
        ? ((t as Tokens.Paragraph).tokens as Token[])
        : [t],
    );
    return <ElmBlockQuote key={index}>{render(innerTokens)}</ElmBlockQuote>;
  },

  br: (_token, _render, index) => <br key={index} />,

  code: (token, _render, index) => (
    <ElmCodeBlock key={index} code={token.text.trim()} language={token.lang} />
  ),

  codespan: (token, _render, index) => (
    <ElmInlineText key={index} code={true}>
      {token.text}
    </ElmInlineText>
  ),

  def: () => null,

  del: (token, render, index) =>
    token.tokens && token.tokens.length !== 0 ? (
      <ElmInlineText key={index} strikethrough={true}>
        {render(token.tokens as Token[])}
      </ElmInlineText>
    ) : (
      <ElmInlineText key={index} strikethrough={true}>
        {token.text}
      </ElmInlineText>
    ),

  em: (token, render, index) =>
    token.tokens && token.tokens.length !== 0 ? (
      <ElmInlineText key={index} italic={true}>
        {render(token.tokens as Token[])}
      </ElmInlineText>
    ) : (
      <ElmInlineText key={index} italic={true}>
        {token.text}
      </ElmInlineText>
    ),

  escape: () => null,

  heading: (token, render, index) => {
    const level = token.depth as 1 | 2 | 3 | 4 | 5 | 6;
    return token.tokens && token.tokens.length !== 0 ? (
      <ElmHeading key={index} level={level}>
        {render(token.tokens as Token[])}
      </ElmHeading>
    ) : (
      <ElmHeading key={index} level={level} text={token.text} />
    );
  },

  hr: (_token, _render, index) => <ElmDivider key={index} />,

  html: () => null,

  image: (token, _render, index) => (
    <ElmImage
      key={index}
      block={true}
      enableModal={true}
      src={token.href}
      alt={token.text}
    />
  ),

  link: (token, render, index) =>
    token.tokens && token.tokens.length !== 0 ? (
      <ElmInlineText key={index} href={token.href}>
        {render(token.tokens as Token[])}
      </ElmInlineText>
    ) : (
      <ElmInlineText key={index} href={token.href}>
        {token.text}
      </ElmInlineText>
    ),

  list: (token, render, index) => {
    const listItems = token.items.map(
      (item: Tokens.ListItem, i: number) => (
        <li key={i}>{render(item.tokens)}</li>
      ),
    );
    return (
      <ElmList
        key={index}
        listStyle={token.ordered ? "ordered" : "unordered"}
      >
        {listItems}
      </ElmList>
    );
  },

  list_item: (token, render, index) => (
    <li key={index}>
      {token.tokens && token.tokens.length !== 0
        ? render(token.tokens as Token[])
        : token.text}
    </li>
  ),

  paragraph: (token, render, index) =>
    token.tokens && token.tokens.length !== 0 ? (
      <ElmParagraph key={index}>{render(token.tokens as Token[])}</ElmParagraph>
    ) : null,

  space: () => null,

  strong: (token, render, index) =>
    token.tokens && token.tokens.length !== 0 ? (
      <ElmInlineText key={index} bold={true}>
        {render(token.tokens as Token[])}
      </ElmInlineText>
    ) : (
      <ElmInlineText key={index} bold={true}>
        {token.text}
      </ElmInlineText>
    ),

  table: (token, render, index) => {
    const renderTableCells = (cells: Tokens.TableCell[]): React.ReactNode[] =>
      cells.map((cell, i) => (
        <ElmTableCell key={i}>{render(cell.tokens)}</ElmTableCell>
      ));

    const headerRow = (
      <ElmTableRow>{renderTableCells(token.header)}</ElmTableRow>
    );

    const bodyRows = token.rows.map((row: Tokens.TableCell[], i: number) => (
      <ElmTableRow key={i}>{renderTableCells(row)}</ElmTableRow>
    ));

    return (
      <ElmTable
        key={index}
        header={<ElmTableHeader>{headerRow}</ElmTableHeader>}
        body={<ElmTableBody>{bodyRows}</ElmTableBody>}
      />
    );
  },

  text: (token, render, index) =>
    token.tokens && token.tokens.length !== 0 ? (
      <ElmInlineText key={index}>
        {render(token.tokens as Token[])}
      </ElmInlineText>
    ) : (
      <React.Fragment key={index}>{token.text}</React.Fragment>
    ),
};

export const ElmMarkdown = ({
  markdown,
  style,
  renderFunctionMap,
}: ElmMarkdownProps) => {
  const mergedRenderFunctionMap = {
    ...defaultRenderFunctionMap,
    ...renderFunctionMap,
  };

  const render = (tokens: Token[]): React.ReactNode[] =>
    tokens.map((token, index) => {
      const handler =
        mergedRenderFunctionMap[token.type as keyof TokenTypeMap];
      if (handler) {
        return (handler as RenderFunction<keyof TokenTypeMap, React.ReactNode>)(
          token as TokenTypeMap[keyof TokenTypeMap],
          render,
          index,
        );
      }
      return null;
    });

  const tokens = marked.setOptions({ gfm: true }).lexer(markdown);

  return (
    <div
      className={styles["markdown-body"]}
      style={{
        "--elmethis-margin-block-start": "2.5rem",
        ...style,
      }}
    >
      {render(tokens)}
    </div>
  );
};
