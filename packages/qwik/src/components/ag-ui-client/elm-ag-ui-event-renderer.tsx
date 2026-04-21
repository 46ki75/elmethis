import { component$, JSX, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-event-renderer.module.css";
import { BaseEvent, EventType } from "@ag-ui/core";

export interface ElmAgUiEventRendererProps {
  class?: string;

  style?: CSSProperties;

  events: BaseEvent[];
}

export const ElmAgUiEventRenderer = component$<ElmAgUiEventRendererProps>(
  ({ class: className, style, events }) => {
    const render = (event: BaseEvent): JSX.Element | null => {
      switch (event.type) {
        case EventType.RUN_STARTED: {
          break;
        }
      }

      return null;
    };

    return (
      <div class={[styles["elm-my-something"], className]} style={style}>
        {events.map((event) => render(event))}
      </div>
    );
  },
);
