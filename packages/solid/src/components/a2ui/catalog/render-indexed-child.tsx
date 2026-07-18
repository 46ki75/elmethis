import { createMemo, type Accessor, type JSX } from "solid-js";

import type { ChildRef } from "./catalog";

interface RenderIndexedChildProps {
  child: ChildRef;
  index: Accessor<number>;
  renderChild: (
    componentId: string,
    basePath?: string,
    index?: number,
  ) => JSX.Element;
}

/** Keeps a child's sibling index reactive without hiding the accessor in JSX. */
export const RenderIndexedChild = (props: RenderIndexedChildProps) => {
  const rendered = createMemo(() =>
    props.renderChild(props.child.id, props.child.basePath, props.index()),
  );
  return <>{rendered()}</>;
};
