import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";
import { component$, useStore } from "@qwik.dev/core";

import { useBindableStore } from "./use-bindable-store";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

interface FormState {
  name: string;
  age: number;
}

const UncontrolledWrapper = component$(() => {
  const form = useBindableStore<FormState>({
    defaultValue: { name: "Alice", age: 30 },
  });
  return (
    <div>
      <span id="name">{form.name}</span>
      <span id="age">{form.age}</span>
      <button id="btn-rename" onClick$={() => (form.name = "Bob")}>
        Rename
      </button>
      <button id="btn-age-up" onClick$={() => (form.age += 1)}>
        Age +1
      </button>
    </div>
  );
});

const ControlledChild = component$((props: { external: FormState }) => {
  const form = useBindableStore({
    store: props.external,
    defaultValue: { name: "ignored", age: -1 },
  });
  return (
    <div>
      <span id="child-name">{form.name}</span>
      <span id="child-age">{form.age}</span>
      <button id="btn-child-rename" onClick$={() => (form.name = "Bob")}>
        Rename via child
      </button>
    </div>
  );
});

const ControlledWrapper = component$(() => {
  const external = useStore<FormState>({ name: "Alice", age: 30 });
  return (
    <div>
      <span id="parent-name">{external.name}</span>
      <span id="parent-age">{external.age}</span>
      <ControlledChild external={external} />
      <button id="btn-parent-rename" onClick$={() => (external.name = "Carol")}>
        Rename via parent
      </button>
    </div>
  );
});

interface NestedState {
  user: { name: string; profile: { city: string } };
}

const NestedChild = component$((props: { external: NestedState }) => {
  const state = useBindableStore({
    store: props.external,
    defaultValue: { user: { name: "ignored", profile: { city: "ignored" } } },
  });
  return (
    <div>
      <span id="nested-name">{state.user.name}</span>
      <span id="nested-city">{state.user.profile.city}</span>
      <button id="btn-nested-name" onClick$={() => (state.user.name = "Bob")}>
        Set nested name
      </button>
      <button
        id="btn-nested-city"
        onClick$={() => (state.user.profile.city = "Tokyo")}
      >
        Set nested city
      </button>
    </div>
  );
});

const NestedWrapper = component$(() => {
  const external = useStore<NestedState>({
    user: { name: "Alice", profile: { city: "Berlin" } },
  });
  return (
    <div>
      <span id="parent-nested-name">{external.user.name}</span>
      <span id="parent-nested-city">{external.user.profile.city}</span>
      <NestedChild external={external} />
    </div>
  );
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("uncontrolled: renders the default values", async () => {
    const result = await renderToString(<UncontrolledWrapper />, {
      containerTagName: "div",
    });
    expect(result.html).toMatch(/<span [^>]*id="name"[^>]*>Alice<\/span>/);
    expect(result.html).toMatch(/<span [^>]*id="age"[^>]*>30<\/span>/);
  });

  test("controlled: renders the parent store's values", async () => {
    const result = await renderToString(<ControlledWrapper />, {
      containerTagName: "div",
    });
    expect(result.html).toMatch(
      /<span [^>]*id="child-name"[^>]*>Alice<\/span>/,
    );
    expect(result.html).toMatch(/<span [^>]*id="child-age"[^>]*>30<\/span>/);
  });
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR]", () => {
  test("uncontrolled: renders the default values", async () => {
    const { screen, render } = await createDOM();
    await render(<UncontrolledWrapper />);
    expect(screen.querySelector("#name")!.textContent).toBe("Alice");
    expect(screen.querySelector("#age")!.textContent).toBe("30");
  });

  test("uncontrolled: writes update the display", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<UncontrolledWrapper />);

    await userEvent("#btn-rename", "click");
    await userEvent("#btn-age-up", "click");

    expect(screen.querySelector("#name")!.textContent).toBe("Bob");
    expect(screen.querySelector("#age")!.textContent).toBe("31");
  });

  test("controlled: parent and child see the same initial values", async () => {
    const { screen, render } = await createDOM();
    await render(<ControlledWrapper />);

    expect(screen.querySelector("#parent-name")!.textContent).toBe("Alice");
    expect(screen.querySelector("#child-name")!.textContent).toBe("Alice");
  });

  test("controlled: writes from the child propagate to the parent", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ControlledWrapper />);

    await userEvent("#btn-child-rename", "click");

    expect(screen.querySelector("#child-name")!.textContent).toBe("Bob");
    expect(screen.querySelector("#parent-name")!.textContent).toBe("Bob");
  });

  test("controlled: writes from the parent propagate to the child", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ControlledWrapper />);

    await userEvent("#btn-parent-rename", "click");

    expect(screen.querySelector("#parent-name")!.textContent).toBe("Carol");
    expect(screen.querySelector("#child-name")!.textContent).toBe("Carol");
  });

  test("controlled: nested-property writes propagate in both directions", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<NestedWrapper />);

    await userEvent("#btn-nested-name", "click");
    await userEvent("#btn-nested-city", "click");

    expect(screen.querySelector("#nested-name")!.textContent).toBe("Bob");
    expect(screen.querySelector("#parent-nested-name")!.textContent).toBe(
      "Bob",
    );
    expect(screen.querySelector("#nested-city")!.textContent).toBe("Tokyo");
    expect(screen.querySelector("#parent-nested-city")!.textContent).toBe(
      "Tokyo",
    );
  });
});
