import { describe, expect, test } from "vitest";
import { useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useBindableStore } from "./use-bindable-store";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

interface FormState {
  name: string;
  age: number;
}

const UncontrolledWrapper = () => {
  const [form, setForm] = useBindableStore<FormState>({
    defaultValue: { name: "Alice", age: 30 },
  });
  return (
    <div>
      <span id="name">{form.name}</span>
      <span id="age">{form.age}</span>
      <button
        id="btn-rename"
        onClick={() => setForm((prev) => ({ ...prev, name: "Bob" }))}
      >
        Rename
      </button>
      <button
        id="btn-age-up"
        onClick={() => setForm((prev) => ({ ...prev, age: prev.age + 1 }))}
      >
        Age +1
      </button>
    </div>
  );
};

const ControlledChild = (props: {
  external: FormState;
  onChange: (value: FormState) => void;
}) => {
  const [form, setForm] = useBindableStore({
    value: props.external,
    defaultValue: { name: "ignored", age: -1 },
    onChange: props.onChange,
  });
  return (
    <div>
      <span id="child-name">{form.name}</span>
      <span id="child-age">{form.age}</span>
      <button
        id="btn-child-rename"
        onClick={() => setForm((prev) => ({ ...prev, name: "Bob" }))}
      >
        Rename via child
      </button>
    </div>
  );
};

const ControlledWrapper = () => {
  const [external, setExternal] = useState<FormState>({
    name: "Alice",
    age: 30,
  });
  return (
    <div>
      <span id="parent-name">{external.name}</span>
      <span id="parent-age">{external.age}</span>
      <ControlledChild external={external} onChange={setExternal} />
      <button
        id="btn-parent-rename"
        onClick={() => setExternal((prev) => ({ ...prev, name: "Carol" }))}
      >
        Rename via parent
      </button>
    </div>
  );
};

interface NestedState {
  user: { name: string; profile: { city: string } };
}

const NestedChild = (props: {
  external: NestedState;
  onChange: (value: NestedState) => void;
}) => {
  const [state, setState] = useBindableStore({
    value: props.external,
    defaultValue: { user: { name: "ignored", profile: { city: "ignored" } } },
    onChange: props.onChange,
  });
  return (
    <div>
      <span id="nested-name">{state.user.name}</span>
      <span id="nested-city">{state.user.profile.city}</span>
      <button
        id="btn-nested-name"
        onClick={() =>
          setState((prev) => ({
            ...prev,
            user: { ...prev.user, name: "Bob" },
          }))
        }
      >
        Set nested name
      </button>
      <button
        id="btn-nested-city"
        onClick={() =>
          setState((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              profile: { ...prev.user.profile, city: "Tokyo" },
            },
          }))
        }
      >
        Set nested city
      </button>
    </div>
  );
};

const NestedWrapper = () => {
  const [external, setExternal] = useState<NestedState>({
    user: { name: "Alice", profile: { city: "Berlin" } },
  });
  return (
    <div>
      <span id="parent-nested-name">{external.user.name}</span>
      <span id="parent-nested-city">{external.user.profile.city}</span>
      <NestedChild external={external} onChange={setExternal} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("uncontrolled: renders the default values", () => {
    const html = renderToStaticMarkup(<UncontrolledWrapper />);
    expect(html).toMatch(/<span [^>]*id="name"[^>]*>Alice<\/span>/);
    expect(html).toMatch(/<span [^>]*id="age"[^>]*>30<\/span>/);
  });

  test("controlled: renders the parent store's values", () => {
    const html = renderToStaticMarkup(<ControlledWrapper />);
    expect(html).toMatch(/<span [^>]*id="child-name"[^>]*>Alice<\/span>/);
    expect(html).toMatch(/<span [^>]*id="child-age"[^>]*>30<\/span>/);
  });
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR]", () => {
  test("uncontrolled: renders the default values", () => {
    const { container } = render(<UncontrolledWrapper />);
    expect(container.querySelector("#name")!.textContent).toBe("Alice");
    expect(container.querySelector("#age")!.textContent).toBe("30");
  });

  test("uncontrolled: writes update the display", () => {
    const { container } = render(<UncontrolledWrapper />);

    fireEvent.click(container.querySelector("#btn-rename")!);
    fireEvent.click(container.querySelector("#btn-age-up")!);

    expect(container.querySelector("#name")!.textContent).toBe("Bob");
    expect(container.querySelector("#age")!.textContent).toBe("31");
  });

  test("controlled: parent and child see the same initial values", () => {
    const { container } = render(<ControlledWrapper />);

    expect(container.querySelector("#parent-name")!.textContent).toBe("Alice");
    expect(container.querySelector("#child-name")!.textContent).toBe("Alice");
  });

  test("controlled: writes from the child propagate to the parent", () => {
    const { container } = render(<ControlledWrapper />);

    fireEvent.click(container.querySelector("#btn-child-rename")!);

    expect(container.querySelector("#child-name")!.textContent).toBe("Bob");
    expect(container.querySelector("#parent-name")!.textContent).toBe("Bob");
  });

  test("controlled: writes from the parent propagate to the child", () => {
    const { container } = render(<ControlledWrapper />);

    fireEvent.click(container.querySelector("#btn-parent-rename")!);

    expect(container.querySelector("#parent-name")!.textContent).toBe("Carol");
    expect(container.querySelector("#child-name")!.textContent).toBe("Carol");
  });

  test("controlled: nested-property writes propagate in both directions", () => {
    const { container } = render(<NestedWrapper />);

    fireEvent.click(container.querySelector("#btn-nested-name")!);
    fireEvent.click(container.querySelector("#btn-nested-city")!);

    expect(container.querySelector("#nested-name")!.textContent).toBe("Bob");
    expect(container.querySelector("#parent-nested-name")!.textContent).toBe(
      "Bob",
    );
    expect(container.querySelector("#nested-city")!.textContent).toBe("Tokyo");
    expect(container.querySelector("#parent-nested-city")!.textContent).toBe(
      "Tokyo",
    );
  });
});
