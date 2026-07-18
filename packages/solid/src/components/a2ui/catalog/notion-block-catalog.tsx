import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  Show,
  type JSX,
} from "solid-js";

import {
  ComponentContext,
  GenericBinder,
  type ComponentModel,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  AudioApi,
  BlockImageApi,
  BlockQuoteApi,
  BookmarkApi,
  CalloutApi,
  CodeBlockApi,
  ColumnApi,
  ColumnListApi,
  ContentTabApi,
  ContentTabsApi,
  DividerApi,
  FileApi,
  HeadingApi,
  HtmlApi,
  IconApi,
  KatexApi,
  LinkTextApi,
  ListApi,
  ListItemApi,
  MermaidApi,
  NotionCalloutApi,
  ParagraphApi,
  RichTextApi,
  TableApi,
  TableCellApi,
  TableRowApi,
  ToggleApi,
  UnsupportedApi,
  VideoApi,
} from "@elmethis/core";

import { ElmCodeBlock } from "../../code/elm-code-block";
import { ElmHtmlViewer } from "../../code/elm-html-viewer";
import { ElmKatex } from "../../code/elm-katex";
import {
  ElmTab,
  ElmTabList,
  ElmTabPanel,
  ElmTabs,
} from "../../containments/elm-tabs";
import { ElmToggle } from "../../containments/elm-toggle";
import { ElmUnsupportedBlock } from "../../fallback/elm-unsupported-block";
import { ElmInlineIcon } from "../../icon/elm-inline-icon";
import { ElmAudioPlayer } from "../../media/elm-audio-player";
import { ElmBlockImage } from "../../media/elm-block-image";
import { ElmFile } from "../../media/elm-file";
import { ElmNotionCallout } from "../../notion/elm-notion-callout";
import { ElmBookmark } from "../../navigation/elm-bookmark";
import {
  ElmTable,
  ElmTableBody,
  ElmTableCell,
  ElmTableHeader,
  ElmTableRow,
} from "../../table";
import { ElmBlockQuote } from "../../typography/elm-block-quote";
import { ElmCallout } from "../../typography/elm-callout";
import { ElmDivider } from "../../typography/elm-divider";
import { ElmHeading } from "../../typography/elm-heading";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { ElmList } from "../../typography/elm-list";
import { ElmParagraph } from "../../typography/elm-paragraph";
import { basicCatalog } from "./basic-catalog";
import {
  CatalogRenderer,
  defineRenderer,
  type ChildRef,
  type SolidRendererEntry,
} from "./catalog";
import { alignItemsMap, justifyContentMap } from "./catalog-utils";
import { RenderIndexedChild } from "./render-indexed-child";

const columnListStyle: JSX.CSSProperties = {
  "box-sizing": "content-box",
  "padding-block": "0.25rem",
  width: "100%",
  display: "flex",
  "flex-direction": "row",
  gap: "0.25rem",
  "justify-content": "space-around",
  "overflow-x": "auto",
};

interface BoundContentTabProps {
  id: string;
  basePath: string;
  surface: SurfaceModel<SolidRendererEntry>;
  renderChild: (id: string, basePath?: string, index?: number) => JSX.Element;
  slot: "label" | "content";
}

const childRefs = (value: unknown, basePath: string): ChildRef[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((child) => {
    if (typeof child === "string") return [{ id: child, basePath }];
    if (
      child != null &&
      typeof child === "object" &&
      "id" in child &&
      "basePath" in child &&
      typeof child.id === "string" &&
      typeof child.basePath === "string"
    ) {
      return [{ id: child.id, basePath: child.basePath }];
    }
    return [];
  });
};

/** Binds data-only ContentTab models so template label/content lists stay live. */
const BoundContentTab = (props: BoundContentTabProps) => {
  const [model, setModel] = createSignal<ComponentModel>();
  const [bound, setBound] = createSignal<Record<string, unknown>>({});

  createEffect(() => {
    const surface = props.surface;
    const id = props.id;
    setModel(surface.componentsModel.get(id));
    const created = surface.componentsModel.onCreated.subscribe((next) => {
      if (next.id === id) setModel(next);
    });
    const deleted = surface.componentsModel.onDeleted.subscribe((deletedId) => {
      if (deletedId === id) setModel(undefined);
    });
    onCleanup(() => {
      created.unsubscribe();
      deleted.unsubscribe();
    });
  });

  createEffect(() => {
    if (model() == null) {
      setBound({});
      return;
    }
    const context = new ComponentContext(
      props.surface,
      props.id,
      props.basePath,
    );
    const binder = new GenericBinder<Record<string, unknown>>(
      context,
      ContentTabApi.schema,
    );
    setBound({ ...binder.snapshot });
    const subscription = binder.subscribe((next: Record<string, unknown>) =>
      setBound({ ...next }),
    );
    onCleanup(() => {
      subscription.unsubscribe();
      binder.dispose();
    });
  });

  return (
    <For each={childRefs(bound()[props.slot], props.basePath)}>
      {(child, index) => (
        <RenderIndexedChild
          child={child}
          index={index}
          renderChild={props.renderChild}
        />
      )}
    </For>
  );
};

const blockComponents = [
  defineRenderer(RichTextApi, (props) => (
    <Show
      when={!props.props.decoration?.includes("katex")}
      fallback={<ElmKatex expression={props.props.text} block={false} />}
    >
      <ElmInlineText
        bold={props.props.decoration?.includes("bold")}
        italic={props.props.decoration?.includes("italic")}
        underline={props.props.decoration?.includes("underline")}
        strikethrough={props.props.decoration?.includes("strikethrough")}
        code={props.props.decoration?.includes("code")}
        color={props.props.color}
        ruby={props.props.ruby}
      >
        {props.props.text}
      </ElmInlineText>
    </Show>
  )),
  defineRenderer(LinkTextApi, (props) => (
    <ElmInlineText href={props.props.href} favicon={props.props.favicon}>
      {props.props.text}
    </ElmInlineText>
  )),
  defineRenderer(IconApi, (props) => (
    <ElmInlineIcon src={props.props.src} alt={props.props.alt} />
  )),
  defineRenderer(ColumnApi, (props) => (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "justify-content": justifyContentMap[props.props.justify ?? "start"],
        "align-items": alignItemsMap[props.props.align ?? "stretch"],
        flex:
          props.props.widthRatio == null
            ? undefined
            : String(props.props.widthRatio),
        "box-sizing": "border-box",
        padding: "0.125rem",
        gap: "var(--elmethis-stack-gap)",
      }}
    >
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </div>
  )),
  defineRenderer(ColumnListApi, (props) => (
    <div style={columnListStyle}>
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </div>
  )),
  defineRenderer(HeadingApi, (props) => (
    <ElmHeading level={props.props.level}>
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmHeading>
  )),
  defineRenderer(ParagraphApi, (props) => (
    <ElmParagraph
      color={props.props.color}
      backgroundColor={props.props.backgroundColor}
    >
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmParagraph>
  )),
  defineRenderer(ListApi, (props) => (
    <ElmList listStyle={props.props.style ?? "unordered"}>
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <li>
            <RenderIndexedChild
              child={child}
              index={index}
              renderChild={props.renderChild}
            />
          </li>
        )}
      </For>
    </ElmList>
  )),
  defineRenderer(ListItemApi, (props) => (
    <For each={props.childRefs(props.props.children)}>
      {(child, index) => (
        <RenderIndexedChild
          child={child}
          index={index}
          renderChild={props.renderChild}
        />
      )}
    </For>
  )),
  defineRenderer(BlockQuoteApi, (props) => (
    <ElmBlockQuote cite={props.props.cite}>
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmBlockQuote>
  )),
  defineRenderer(CalloutApi, (props) => (
    <ElmCallout type={props.props.type}>
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmCallout>
  )),
  defineRenderer(NotionCalloutApi, (props) => (
    <ElmNotionCallout
      icon={props.props.icon}
      color={props.props.color}
      variant={props.props.variant}
    >
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmNotionCallout>
  )),
  defineRenderer(DividerApi, () => <ElmDivider />),
  defineRenderer(ToggleApi, (props) => (
    <ElmToggle
      summary={
        <For each={props.childRefs(props.props.summary)}>
          {(child, index) => (
            <RenderIndexedChild
              child={child}
              index={index}
              renderChild={props.renderChild}
            />
          )}
        </For>
      }
    >
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmToggle>
  )),
  defineRenderer(BookmarkApi, (props) => (
    <ElmBookmark
      url={props.props.url}
      title={props.props.title}
      description={props.props.description}
      image={props.props.image}
    />
  )),
  defineRenderer(FileApi, (props) => (
    <ElmFile src={props.props.src} name={props.props.name} />
  )),
  defineRenderer(AudioApi, (props) => (
    <ElmAudioPlayer
      src={props.props.src}
      title={props.props.title}
      artist={props.props.artist}
      seekStep={props.props.seekStep}
      loop={props.props.loop}
      autoPlay={props.props.autoPlay}
    />
  )),
  defineRenderer(VideoApi, (props) => (
    <figure style={{ margin: 0 }}>
      <video
        src={props.props.src}
        poster={props.props.poster}
        title={props.props.title}
        width={props.props.width}
        height={props.props.height}
        loop={props.props.loop}
        autoplay={props.props.autoPlay}
        muted={props.props.muted}
        controls
        style={{ "max-width": "100%", height: "auto" }}
      />
      <Show when={props.props.caption}>
        {(caption) => <figcaption>{caption()}</figcaption>}
      </Show>
    </figure>
  )),
  defineRenderer(BlockImageApi, (props) => (
    <ElmBlockImage
      src={props.props.src}
      alt={props.props.alt}
      width={props.props.width}
      height={props.props.height}
      srcSet={props.props.srcset}
      sizes={props.props.sizes}
      caption={props.props.caption}
      enableModal
    />
  )),
  defineRenderer(HtmlApi, (props) => (
    <ElmHtmlViewer
      html={props.props.html}
      src={props.props.src}
      autoHeight={props.props.autoHeight}
      allowScripts={props.props.allowScripts ?? true}
      height={props.props.height ?? 400}
    />
  )),
  defineRenderer(CodeBlockApi, (props) => (
    <ElmCodeBlock
      code={props.props.code}
      language={props.props.language}
      caption={props.props.caption}
    />
  )),
  defineRenderer(KatexApi, (props) => (
    <ElmKatex expression={props.props.expression} block />
  )),
  defineRenderer(MermaidApi, (props) => (
    <ElmCodeBlock code={props.props.code} language="mermaid" />
  )),
  defineRenderer(ContentTabApi, () => null),
  defineRenderer(ContentTabsApi, (props) => {
    const tabs = () => props.childRefs(props.props.children);
    return (
      <ElmTabs defaultValue="0">
        <ElmTabList>
          <For each={tabs()}>
            {(tab, index) => (
              <ElmTab value={String(index())}>
                <BoundContentTab
                  id={tab.id}
                  basePath={tab.basePath}
                  surface={props.surface}
                  renderChild={props.renderChild}
                  slot="label"
                />
              </ElmTab>
            )}
          </For>
        </ElmTabList>
        <For each={tabs()}>
          {(tab, index) => (
            <ElmTabPanel value={String(index())}>
              <BoundContentTab
                id={tab.id}
                basePath={tab.basePath}
                surface={props.surface}
                renderChild={props.renderChild}
                slot="content"
              />
            </ElmTabPanel>
          )}
        </For>
      </ElmTabs>
    );
  }),
  defineRenderer(TableApi, (props) => (
    <ElmTable
      caption={
        props.props.caption == null ? undefined : String(props.props.caption)
      }
      hasRowHeader={props.props.hasColumnHeader}
    >
      <Show when={props.props.header?.length}>
        <ElmTableHeader>
          <For each={props.childRefs(props.props.header)}>
            {(child, index) => (
              <RenderIndexedChild
                child={child}
                index={index}
                renderChild={props.renderChild}
              />
            )}
          </For>
        </ElmTableHeader>
      </Show>
      <ElmTableBody>
        <For each={props.childRefs(props.props.body)}>
          {(child, index) => (
            <RenderIndexedChild
              child={child}
              index={index}
              renderChild={props.renderChild}
            />
          )}
        </For>
      </ElmTableBody>
    </ElmTable>
  )),
  defineRenderer(TableRowApi, (props) => (
    <ElmTableRow>
      <For each={props.childRefs(props.props.children)}>
        {(child, index) => (
          <RenderIndexedChild
            child={child}
            index={index}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmTableRow>
  )),
  defineRenderer(TableCellApi, (props) => (
    <ElmTableCell isHeader={props.props.isHeader} columnIndex={props.index}>
      <For each={props.childRefs(props.props.children)}>
        {(child, childIndex) => (
          <RenderIndexedChild
            child={child}
            index={childIndex}
            renderChild={props.renderChild}
          />
        )}
      </For>
    </ElmTableCell>
  )),
  defineRenderer(UnsupportedApi, (props) => (
    <ElmUnsupportedBlock
      details={
        props.props.details
          ? `Unsupported component type: ${String(props.props.details)}`
          : "Unsupported component type"
      }
    />
  )),
];

export const notionBlockCatalog: CatalogRenderer = basicCatalog.extend(
  ...blockComponents,
);
export const notionBlockComponents = [
  ...notionBlockCatalog.components.values(),
];
export const notionBlockFunctions = [...notionBlockCatalog.functions];
