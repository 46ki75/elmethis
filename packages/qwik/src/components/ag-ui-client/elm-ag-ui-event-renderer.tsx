import { component$, JSX } from "@builder.io/qwik";

import styles from "./elm-ag-ui-event-renderer.module.css";
import { BaseEvent, EventType } from "@ag-ui/core";

export interface ElmAgUiEventRendererProps {
  events: BaseEvent[];
}

export const ElmAgUiEventRenderer = component$<ElmAgUiEventRendererProps>(
  ({ events }) => {
    const render = (event: BaseEvent): JSX.Element | null => {
      switch (event.type) {
        case EventType.RUN_STARTED: {
          break;
        }
      }

      return null;
    };

    return (
      <div class={styles["elm-my-something"]}>
        {events.map((event) => render(event))}
      </div>
    );
  },
);
