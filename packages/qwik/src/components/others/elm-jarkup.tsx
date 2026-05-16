import { component$, PropsOf, type CSSProperties, type JSXOutput } from "@qwik.dev/core";
import type { Component, InlineComponent } from "jarkup-ts";
import { kebabCase } from "es-toolkit";

import styles from "./elm-jarkup.module.css";

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
import {
  ElmTab,
  ElmTabList,
  ElmTabPanel,
  ElmTabs,
} from "../containments/elm-tabs";
import { ElmUnsupportedBlock } from "../fallback/elm-unsupported-block";

export interface ElmJarkupProps extends PropsOf<"div"> {
  jsonComponents: Component[];

  skipUnsupportedComponentWarning?: boolean;
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
  const { class: className, style, jsonComponents, skipUnsupportedComponentWarning, ...rest } = props;

  const render = (jsonComponents: Component[]): JSXOutput[] => {
    return jsonComponents.map((component, index) => {
      const key = component.id || index;

      const firstStyle =
        index === 0
          ? ({ "--elmethis-margin-block-start": "0" } as CSSProperties)
          : undefined;

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

        case "Fragment": {
          return <>{render(component.slots.default)}</>;
        }

        case "Heading":
          return (
            <ElmHeading
              key={key}
              level={component.props.level}
              id={kebabCase(
                convertInlineComponentsToPlainText(component.slots.default),
              )}
              style={firstStyle}
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
              style={firstStyle}
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
              style={firstStyle}
            >
              {render(component.slots.default)}
            </ElmList>
          );

        case "BlockQuote":
          return (
            <ElmBlockQuote
              key={key}
              cite={component.props?.cite}
              style={firstStyle}
            >
              {render(component.slots.default)}
            </ElmBlockQuote>
          );

        case "Callout":
          return (
            <ElmCallout
              key={key}
              type={component.props?.type}
              style={firstStyle}
            >
              {render(component.slots.default)}
            </ElmCallout>
          );

        case "Divider":
          return <ElmDivider key={key} style={firstStyle} />;

        case "Toggle":
          return (
            <ElmToggle key={key} style={firstStyle}>
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
              style={firstStyle}
            />
          );

        case "File":
          return (
            <ElmFile
              key={key}
              src={component.props.src}
              name={component.props.name}
              style={firstStyle}
            />
          );

        case "Image":
          return (
            <ElmBlockImage
              key={key}
              src={component.props.src}
              alt={component.props.alt}
              width={component.props.width}
              height={component.props.height}
              srcset={component.props.srcset}
              sizes={component.props.sizes}
              enableModal={true}
              style={firstStyle}
            />
          );

        case "CodeBlock":
          return (
            <ElmCodeBlock
              key={key}
              code={component.props.code}
              language={component.props.language}
              style={firstStyle}
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
              style={firstStyle}
            />
          );

        case "Tabs": {
          const labels: InlineComponent[][] = [];
          const contents: Component[][] = [];
          for (const tab of component.slots.default) {
            labels.push(tab.slots.labels);
            contents.push(tab.slots.contents);
          }

          return (
            <ElmTabs defaultValue="0">
              <ElmTabList>
                {labels.map((label, index) => (
                  <ElmTab key={index} value={String(index)}>
                    {render(label)}
                  </ElmTab>
                ))}
              </ElmTabList>
              {labels.map((_, index) => (
                <ElmTabPanel key={index} value={String(index)}>
                  {render(contents[index])}
                </ElmTabPanel>
              ))}
            </ElmTabs>
          );
        }

        case "Table":
          return (
            <ElmTable
              key={key}
              caption={component.props?.caption}
              hasRowHeader={component.props?.hasRowHeader}
              style={firstStyle}
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
            <div key={key} class={styles["column-list"]} style={firstStyle}>
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
                ...firstStyle,
              }}
            >
              {render(component.slots.default)}
            </div>
          );

        case "Unsupported": {
          if (skipUnsupportedComponentWarning) return null;

          return (
            <ElmUnsupportedBlock
              key={key}
              details={`Unsupported component type: ${component.props?.details || component.type}`}
              style={firstStyle}
            />
          );
        }

        default:
          if (skipUnsupportedComponentWarning) return null;

          return (
            <ElmUnsupportedBlock
              key={key}
              details={`Unsupported component type: ${component.type}`}
              style={firstStyle}
            />
          );
      }
    });
  };

  return (
    <div
      class={className}
      style={{ "--elmethis-margin-block-start": "2.5rem", ...(style as CSSProperties) } as CSSProperties}
      {...rest}
    >
      {render(jsonComponents)}
    </div>
  );
});
