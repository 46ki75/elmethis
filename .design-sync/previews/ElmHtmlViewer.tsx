import * as React from "react";
import * as S0 from "@ds-stories/packages/react/src/components/code/elm-html-viewer.stories";
// Same substitution as the owned ElmHtml preview: the RemoteSrc story loads
// /fixtures/advanced-rag-pipeline.html from storybook's staticDirs, which the
// preview page can't serve. Import the fixture as text and pass it via `html`;
// allowScripts carries over so its <script> tags still run.
import fixtureHtml from "@ds-stories/packages/react/public/fixtures/advanced-rag-pipeline.html";

const S: any = {
  ...S0,
  RemoteSrc: {
    ...(S0 as any).RemoteSrc,
    args: {
      ...(S0 as any).RemoteSrc.args,
      src: undefined,
      html: fixtureHtml,
    },
  },
};

function compose(S: any, key: string) {
  const meta: any = S.default ?? {};
  const st: any = S[key];
  const args: any = { ...(meta.args ?? {}), ...(st && st.args ? st.args : {}) };
  // Storybook resolves argTypes.mapping (control value -> real arg) before
  // rendering; mirror that so mapped args don't render raw.
  const at: any = {
    ...(meta.argTypes ?? {}),
    ...(st && st.argTypes ? st.argTypes : {}),
  };
  for (const k of Object.keys(args)) {
    const m = at[k] && at[k].mapping;
    if (m && typeof m === "object" && args[k] in m) args[k] = m[args[k]];
  }
  const title: string = typeof meta.title === "string" ? meta.title : "";
  const ctx: any = {
    args,
    name: key,
    title,
    kind: title,
    id: "",
    componentId: "",
    globals: {},
    viewMode: "story",
    parameters: (st && st.parameters) ?? meta.parameters ?? {},
  };
  let render: (() => any) | null = null;
  if (st && typeof st.render === "function")
    render = () => st.render(args, ctx);
  else if (typeof st === "function") render = () => st(args, ctx);
  else if (typeof meta.render === "function")
    render = () => meta.render(args, ctx);
  else {
    const C = (st && st.component) || meta.component;
    if (C) render = () => React.createElement(C, args);
  }
  if (!render) return () => null;
  // [].concat: a single function is legal CSF decorator shorthand. A
  // decorator returning undefined (stubbed addon) falls through to the inner
  // render — otherwise one unrecognized addon blanks the cell silently.
  const decorators: any[] = ([] as any[])
    .concat((st && st.decorators) ?? [])
    .concat(meta.decorators ?? []);
  return decorators.reduce(
    (inner: any, dec: any) => () => {
      const out = dec(inner, ctx);
      return out === undefined ? inner() : out;
    },
    render,
  );
}

export const ClaudeArtifact = /* Claude Artifact */ compose(
  S,
  "ClaudeArtifact",
);
export const NotionExport = /* Notion Export */ compose(S, "NotionExport");
export const RemoteSrc = /* Remote Src */ compose(S, "RemoteSrc");
