import React, { lazy, Suspense } from "react";
import type { Component, InlineComponent } from "jarkup-ts";
import { kebabCase } from "lodash-es";

import "@styles/global.css";
import styles from "./ElmJarkup.module.css";

import { ElmInlineText } from "@components/typography/ElmInlineText";
import { ElmKatex } from "@components/code/ElmKatex";
import { ElmInlineIcon } from "@components/icon/ElmInlineIcon";
import { ElmHeading } from "@components/typography/ElmHeading";
import { ElmParagraph } from "@components/typography/ElmParagraph";
import { ElmList } from "@components/typography/ElmList";
import { ElmBlockQuote } from "@components/typography/ElmBlockQuote";
import { ElmCallout } from "@components/typography/ElmCallout";
import { ElmDivider } from "@components/typography/ElmDivider";
import { ElmToggle } from "@components/containments/ElmToggle";
import { ElmTabs } from "@components/containments/ElmTabs";
import { ElmBookmark } from "@components/navigation/ElmBookmark";
import { ElmFile } from "@components/media/ElmFile";
import { ElmImage } from "@components/media/ElmImage";
import { ElmCodeBlock } from "@components/code/ElmCodeBlock";
import { ElmTable } from "@components/table/ElmTable";
import { ElmTableHeader } from "@components/table/ElmTableHeader";
import { ElmTableBody } from "@components/table/ElmTableBody";
import { ElmTableRow } from "@components/table/ElmTableRow";
import { ElmTableCell } from "@components/table/ElmTableCell";
import { ElmUnsupportedBlock } from "@components/fallback/ElmUnsupportedBlock";
import { ElmBlockFallback } from "@components/fallback/ElmBlockFallback";
import type { ElmethisCSSVariables } from "@styles/variables";

const ElmMermaid = lazy(() =>
  import("@components/code/ElmMermaid").then((m) => ({
    default: m.ElmMermaid,
  })),
);

export type ElmJarkupCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmJarkupProps {
  style?: React.CSSProperties & ElmJarkupCSSVariables;

  /**
   * JSON component tree to render.
   */
  jsonComponents: Component[];

  /**
   * If true, Unsupported components and unknown types are silently skipped.
   */
  skipUnsupportedComponentWarning?: boolean;
}

const convertInlineComponentsToPlainText = (
  inlineComponents: InlineComponent[],
): string => {
  return inlineComponents
    .map((component) => {
      if (component.type === "Text") {
        return component.props.text;
      }
      return "";
    })
    .join("");
};

export const ElmJarkup = ({
  jsonComponents,
  skipUnsupportedComponentWarning = false,
  style,
}: ElmJarkupProps) => {
  const render = (components: Component[]): React.ReactNode[] => {
    return components.map((component, index) => {
      const key = (component as { id?: string }).id ?? index;

      switch (component.type) {
        case "Text": {
          const { props: p } = component;
          if (p.katex) {
            return <ElmKatex key={key} expression={p.text} block={false} />;
          }
          return (
            <ElmInlineText
              key={key}
              color={p.color}
              backgroundColor={p.backgroundColor}
              bold={p.bold}
              italic={p.italic}
              underline={p.underline}
              strikethrough={p.strikethrough}
              code={p.code}
              ruby={p.ruby}
              href={p.href}
              favicon={p.favicon}
            >
              {p.text}
            </ElmInlineText>
          );
        }

        case "Icon":
          return (
            <ElmInlineIcon
              key={key}
              src={component.props.src}
              alt={component.props.alt}
            />
          );

        case "Fragment":
          return (
            <React.Fragment key={key}>
              {render(component.slots.default)}
            </React.Fragment>
          );

        case "Heading":
          return (
            <ElmHeading
              key={key}
              level={component.props.level}
              id={kebabCase(
                convertInlineComponentsToPlainText(component.slots.default),
              )}
              style={
                index === 0
                  ? { "--elmethis-margin-block-start": "0" }
                  : undefined
              }
            >
              {render(component.slots.default)}
            </ElmHeading>
          );

        case "Paragraph":
          return (
            <ElmParagraph
              key={key}
              backgroundColor={component.props?.backgroundColor}
              style={
                index === 0
                  ? { "--elmethis-margin-block-start": "0" }
                  : undefined
              }
            >
              {render(component.slots.default)}
            </ElmParagraph>
          );

        case "ListItem":
          return <li key={key}>{render(component.slots.default)}</li>;

        case "List":
          return (
            <ElmList
              key={key}
              listStyle={
                component.props?.listStyle === "unordered"
                  ? "unordered"
                  : "ordered"
              }
              style={
                index === 0
                  ? { "--elmethis-margin-block-start": "0" }
                  : undefined
              }
            >
              {render(component.slots.default)}
            </ElmList>
          );

        case "BlockQuote":
          return (
            <ElmBlockQuote
              key={key}
              cite={component.props?.cite}
              style={
                index === 0
                  ? { "--elmethis-margin-block-start": "0" }
                  : undefined
              }
            >
              {render(component.slots.default)}
            </ElmBlockQuote>
          );

        case "Callout":
          return (
            <ElmCallout
              key={key}
              type={component.props?.type}
              style={
                index === 0
                  ? { "--elmethis-margin-block-start": "0" }
                  : undefined
              }
            >
              {render(component.slots.default)}
            </ElmCallout>
          );

        case "Divider":
          return (
            <ElmDivider
              key={key}
              style={
                index === 0
                  ? { "--elmethis-margin-block-start": "0" }
                  : undefined
              }
            />
          );

        case "Toggle":
          return (
            <ElmToggle
              key={key}
              summaryContent={render(component.slots.summary)}
              style={
                index === 0
                  ? { "--elmethis-margin-block-start": "0" }
                  : undefined
              }
            >
              {render(component.slots.default)}
            </ElmToggle>
          );

        case "Bookmark":
          return (
            <ElmBookmark
              key={key}
              url={component.props.url}
              title={component.props.title}
              description={component.props.description}
              image={component.props.image}
            />
          );

        case "File":
          return (
            <ElmFile
              key={key}
              src={component.props.src}
              name={component.props.name}
            />
          );

        case "Image":
          return (
            <ElmImage
              key={key}
              src={component.props.src}
              alt={component.props.alt}
              width={component.props.width}
              height={component.props.height}
              block={true}
              enableModal={true}
            />
          );

        case "CodeBlock":
          return (
            <ElmCodeBlock
              key={key}
              code={component.props.code}
              language={component.props.language}
            />
          );

        case "Katex":
          return (
            <ElmKatex
              key={key}
              expression={component.props.expression}
              block={true}
            />
          );

        case "Mermaid":
          return (
            <Suspense key={key} fallback={<ElmBlockFallback />}>
              <ElmMermaid code={component.props.code} />
            </Suspense>
          );

        case "Tabs": {
          const labels: React.ReactNode[] = [];
          const contents: React.ReactNode[] = [];
          for (const tab of component.slots.default) {
            labels.push(<span>{render(tab.slots.labels)}</span>);
            contents.push(<div>{render(tab.slots.contents)}</div>);
          }
          return (
            <ElmTabs key={key} tabLabels={labels} tabContents={contents} />
          );
        }

        case "Table":
          return (
            <ElmTable
              key={key}
              caption={component.props?.caption}
              hasRowHeader={component.props?.hasRowHeader}
              header={
                component.slots.header ? (
                  <ElmTableHeader>
                    {render(component.slots.header)}
                  </ElmTableHeader>
                ) : undefined
              }
              body={<ElmTableBody>{render(component.slots.body)}</ElmTableBody>}
            />
          );

        case "TableRow":
          return (
            <ElmTableRow key={key}>
              {render(component.slots.default)}
            </ElmTableRow>
          );

        case "TableCell":
          return (
            <ElmTableCell key={key}>
              {render(component.slots.default)}
            </ElmTableCell>
          );

        case "ColumnList":
          return (
            <div key={key} className={styles["column-list"]}>
              {render(component.slots.default)}
            </div>
          );

        case "Column":
          return (
            <div
              key={key}
              className={styles.column}
              style={
                {
                  "--width-ratio": component.props?.widthRatio ?? 1,
                  width: component.props?.widthRatio
                    ? `${component.props.widthRatio * 100}%`
                    : undefined,
                } as React.CSSProperties
              }
            >
              {render(component.slots.default)}
            </div>
          );

        case "Unsupported": {
          if (skipUnsupportedComponentWarning) return null;
          return (
            <ElmUnsupportedBlock
              key={key}
              details={
                component.props?.details ??
                `Unsupported component type: ${component.type}`
              }
            />
          );
        }

        default: {
          if (skipUnsupportedComponentWarning) return null;
          return (
            <ElmUnsupportedBlock
              key={key}
              details={`Unsupported component type: ${(component as { type: string }).type}`}
            />
          );
        }
      }
    });
  };

  return (
    <div
      className={styles["jarkup-body"]}
      style={{
        "--elmethis-margin-block-start":
          style?.["--elmethis-margin-block-start"] ?? "5rem",
        ...style,
      }}
    >
      {render(jsonComponents)}
    </div>
  );
};
