import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";
import { component$, useSignal, type Signal } from "@qwik.dev/core";

import { useControllableSignal } from "./use-controllable-signal";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const UncontrolledWrapper = component$(() => {
  const bound = useControllableSignal<string>({ defaultValue: "default" });
  return (
    <div>
      <span id="bound">{bound.value}</span>
      <button id="btn-set" onClick$={() => (bound.value = "from-bound")}>
        Set bound
      </button>
    </div>
  );
});

const ControlledChild = component$((props: { external: Signal<string> }) => {
  const bound = useControllableSignal({
    signal: props.external,
    defaultValue: "ignored-when-controlled",
  });
  return (
    <div>
      <span id="bound">{bound.value}</span>
      <button id="btn-from-bound" onClick$={() => (bound.value = "from-bound")}>
        Set via bound
      </button>
    </div>
  );
});

const ControlledWrapper = component$(() => {
  const external = useSignal("initial");
  return (
    <div>
      <span id="external">{external.value}</span>
      <ControlledChild external={external} />
      <button
        id="btn-from-external"
        onClick$={() => (external.value = "from-external")}
      >
        Set via external
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("uncontrolled: renders the default value", async () => {
    const result = await renderToString(<UncontrolledWrapper />, {
      containerTagName: "div",
    });
    expect(result.html).toContain("default");
  });

  test("controlled: renders the parent signal's value", async () => {
    const result = await renderToString(<ControlledWrapper />, {
      containerTagName: "div",
    });
    // The visible <span id="bound"> must render the parent's value.
    // (Note: the internal fallback signal's seed value still ends up in
    // Qwik's `<script type="qwik/state">` for resumption — that's expected
    // and tested separately in CSR.)
    expect(result.html).toMatch(/<span [^>]*id="bound"[^>]*>initial<\/span>/);
  });
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR]", () => {
  test("uncontrolled: renders the default value", async () => {
    const { screen, render } = await createDOM();
    await render(<UncontrolledWrapper />);
    expect(screen.querySelector("#bound")!.textContent).toBe("default");
  });

  test("uncontrolled: writes via the returned signal update the display", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<UncontrolledWrapper />);

    await userEvent("#btn-set", "click");

    expect(screen.querySelector("#bound")!.textContent).toBe("from-bound");
  });

  test("controlled: parent's signal value is the source of truth", async () => {
    const { screen, render } = await createDOM();
    await render(<ControlledWrapper />);
    expect(screen.querySelector("#external")!.textContent).toBe("initial");
    expect(screen.querySelector("#bound")!.textContent).toBe("initial");
  });

  test("controlled: writes from the child propagate to the parent signal", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ControlledWrapper />);

    await userEvent("#btn-from-bound", "click");

    expect(screen.querySelector("#bound")!.textContent).toBe("from-bound");
    expect(screen.querySelector("#external")!.textContent).toBe("from-bound");
  });

  test("controlled: writes from the parent propagate to the child", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ControlledWrapper />);

    await userEvent("#btn-from-external", "click");

    expect(screen.querySelector("#external")!.textContent).toBe(
      "from-external",
    );
    expect(screen.querySelector("#bound")!.textContent).toBe("from-external");
  });
});
