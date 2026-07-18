import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { createDebounced } from "./create-debounced";
import { createDelayedSignal } from "./create-delayed-signal";
import { createThrottled } from "./create-throttled";

const panelStyle = {
  "font-family": "monospace",
  display: "grid",
  gap: "0.75rem",
  "max-width": "40rem",
  padding: "1rem",
};

const Values = (props: {
  immediate: () => string;
  derived: () => string;
  status: () => boolean;
  statusLabel: string;
}) => (
  <dl>
    <dt>Immediate</dt>
    <dd>{props.immediate()}</dd>
    <dt>Derived</dt>
    <dd>{props.derived()}</dd>
    <dt>{props.statusLabel}</dt>
    <dd>{String(props.status())}</dd>
  </dl>
);

const DebouncedSearch = () => {
  const search = createDebounced("", 500);

  return (
    <section style={panelStyle}>
      <p>
        Type quickly. The derived query settles 500 ms after the last input.
      </p>
      <input
        aria-label="Search query"
        placeholder="Search..."
        value={search.value()}
        onInput={(event) => search.setValue(event.currentTarget.value)}
      />
      <Values
        immediate={search.value}
        derived={search.debouncedValue}
        status={search.isPending}
        statusLabel="Pending"
      />
    </section>
  );
};

const ThrottledCounter = () => {
  const count = createThrottled(0, 600);

  return (
    <section style={panelStyle}>
      <p>
        Click rapidly. The first count is published immediately and the latest
        count is published on the trailing edge.
      </p>
      <button
        type="button"
        onClick={() => count.setValue((value) => value + 1)}
      >
        Increment
      </button>
      <Values
        immediate={() => String(count.value())}
        derived={() => String(count.throttledValue())}
        status={count.isCooling}
        statusLabel="Cooling"
      />
    </section>
  );
};

const ImperativeDelay = () => {
  const message = createDelayedSignal("Ready");

  return (
    <section style={panelStyle}>
      <p>
        Dispatch updates the immediate message now and the delayed message one
        second later. A second dispatch cancels the first.
      </p>
      <button
        type="button"
        onClick={() => message.dispatch(`Dispatched at ${Date.now()}`, 1000)}
      >
        Dispatch
      </button>
      <Values
        immediate={message.value}
        derived={message.delayedValue}
        status={message.isValueChanging}
        statusLabel="Changing"
      />
    </section>
  );
};

const meta = {
  title: "Primitives/Timing Utilities",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Debounce: Story = { render: () => <DebouncedSearch /> };
export const LeadingAndTrailingThrottle: Story = {
  render: () => <ThrottledCounter />,
};
export const ImperativeDelayedSignal: Story = {
  render: () => <ImperativeDelay />,
};
