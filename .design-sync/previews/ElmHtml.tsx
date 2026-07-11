import * as React from "react";
import * as S0 from "@ds-stories/packages/react/src/components/code/elm-html.stories";
// The AdvancedRagPipeline story loads /fixtures/advanced-rag-pipeline.html from
// storybook's staticDirs — an origin-relative asset the preview page can't serve.
// Import the same fixture as text (cfg.storyImports.loaders ".html": "text") and
// render it via the component's `html` prop instead; allowScripts carries over,
// so the fixture's own <script> tags still run.
import fixtureHtml from "@ds-stories/packages/react/public/fixtures/advanced-rag-pipeline.html";

const S: any = {
  ...S0,
  AdvancedRagPipeline: {
    ...(S0 as any).AdvancedRagPipeline,
    args: {
      ...(S0 as any).AdvancedRagPipeline.args,
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
export const Images = /* Images */ compose(S, "Images");
export const FixedHeight = /* Fixed Height */ compose(S, "FixedHeight");
export const AllowScripts = /* Allow Scripts */ compose(S, "AllowScripts");
export const AdvancedRagPipeline = /* Advanced Rag Pipeline */ compose(
  S,
  "AdvancedRagPipeline",
);
