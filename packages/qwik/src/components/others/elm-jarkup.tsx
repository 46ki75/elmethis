import { component$, type JSXOutput } from "@builder.io/qwik";
import type { Component, InlineComponent } from "jarkup-ts";
import { kebabCase } from "lodash-es";

import styles from "./elm-jarkup.module.scss";

import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmKatex } from "../code/elm-katex";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmHeading } from "../typography/elm-heading";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmList } from "../typography/elm-list";
import { ElmBlockQuote } from "../typography/elm-block-quote";
import { ElmCallout } from "../typography/elm-callout";
import { ElmDivider } from "../typography/elm-divider";
import { ElmToggle } from "../containments/elm-toggle";
import { ElmBookmark } from "../navigation/elm-bookmark";
import { ElmFile } from "../media/elm-file";
import { ElmBlockImage } from "../media/elm-block-image";
import { ElmCodeBlock } from "../code/elm-code-block";
import {
  ElmTable,
  ElmTableHeader,
  ElmTableBody,
  ElmTableRow,
  ElmTableCell,
} from "../table";

export interface ElmJarkupProps {
  jsonComponents: Component[];
}

const convertInlineComponentsToPlainText = (
  inlineComponents: InlineComponent[],
): string => {
  return inlineComponents
    .map((component) => {
      if (component.type === "Text") {
        return component.props.text;
      } else {
        return "";
      }
    })
    .join("");
};

export const ElmJarkup = component$<ElmJarkupProps>((props) => {
  const render = (jsonComponents: Component[]): JSXOutput[] => {
    return jsonComponents.map((component, index) => {
      const key = component.id || index;

      switch (component.type) {
        case "Text": {
          const { props: p } = component;
          if (p.katex) {
            return <ElmKatex key={key} expression={p.text} block={false} />;
          }
          return (
            <ElmInlineText
              key={key}
              text={p.text}
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
            />
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

        case "Heading":
          return (
            <ElmHeading
              key={key}
              level={component.props.level}
              id={kebabCase(
                convertInlineComponentsToPlainText(component.slots.default),
              )}
            >
              {render(component.slots.default)}
            </ElmHeading>
          );

        case "Paragraph":
          return (
            <ElmParagraph
              key={key}
              color={component.props?.color}
              backgroundColor={component.props?.backgroundColor}
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
            >
              {render(component.slots.default)}
            </ElmList>
          );

        case "BlockQuote":
          return (
            <ElmBlockQuote key={key} cite={component.props?.cite}>
              {render(component.slots.default)}
            </ElmBlockQuote>
          );

        case "Callout":
          return (
            <ElmCallout key={key} type={component.props?.type}>
              {render(component.slots.default)}
            </ElmCallout>
          );

        case "Divider":
          return <ElmDivider key={key} />;

        case "Toggle":
          return (
            <ElmToggle key={key}>
              <div q:slot="summary">{render(component.slots.summary)}</div>
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
            <ElmBlockImage
              key={key}
              src={component.props.src}
              alt={component.props.alt}
              enableModal={true}
            />
          );

        case "CodeBlock":
          return (
            <ElmCodeBlock
              key={key}
              code={component.props.code}
              language={component.props.language}
            >
              {component.slots?.default && render(component.slots.default)}
            </ElmCodeBlock>
          );

        case "Katex":
          return (
            <ElmKatex
              key={key}
              expression={component.props.expression}
              block={true}
            />
          );

        case "Table":
          return (
            <ElmTable
              key={key}
              caption={component.props?.caption}
              hasRowHeader={component.props?.hasRowHeader}
            >
              {component.slots.header && (
                <ElmTableHeader>
                  {render(component.slots.header)}
                </ElmTableHeader>
              )}
              <ElmTableBody>{render(component.slots.body)}</ElmTableBody>
            </ElmTable>
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
            <div key={key} class={styles["column-list"]}>
              {render(component.slots.default)}
            </div>
          );

        case "Column":
          return (
            <div
              key={key}
              class={styles.column}
              style={{
                "--width-ratio": component.props?.widthRatio || 1,
                width: component.props?.widthRatio
                  ? `${component.props.widthRatio * 100}%`
                  : undefined,
              }}
            >
              {render(component.slots.default)}
            </div>
          );

        default:
          return (
            <div key={key} style={{ color: "red", border: "1px solid red" }}>
              Unsupported component type: {component.type}
            </div>
          );
      }
    });
  };

  return (
    <div class={[styles["jarkup-body"]]}>{render(props.jsonComponents)}</div>
  );
});
