import { type Accessor, type JSX } from "solid-js";

import type { ChildRef } from "./catalog";

interface RenderIndexedChildProps {
  child: ChildRef;
  index: Accessor<number>;
  renderChild: (
    componentId: string,
    basePath?: string,
    index?: number | Accessor<number>,
  ) => JSX.Element;
}

/** Passes the reactive sibling index through without rebuilding child JSX. */
export const RenderIndexedChild = (props: RenderIndexedChildProps) => (
  <>{props.renderChild(props.child.id, props.child.basePath, props.index)}</>
);
