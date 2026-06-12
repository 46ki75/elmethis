import { describe, expect, test } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";

import { useBindableSignal } from "./use-bindable-signal";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const UncontrolledWrapper = () => {
  const [bound, setBound] = useBindableSignal<string>({
    defaultValue: "default",
  });
  return (
    <div>
      <span id="bound">{bound}</span>
      <button id="btn-set" onClick={() => setBound("from-bound")}>
        Set bound
      </button>
    </div>
  );
};

const ControlledChild = (props: {
  external: string;
  onExternalChange: (value: string) => void;
}) => {
  const [bound, setBound] = useBindableSignal({
    value: props.external,
    defaultValue: "ignored-when-controlled",
    onChange: props.onExternalChange,
  });
  return (
    <div>
      <span id="bound">{bound}</span>
      <button id="btn-from-bound" onClick={() => setBound("from-bound")}>
        Set via bound
      </button>
    </div>
  );
};

const ControlledWrapper = () => {
  const [external, setExternal] = useState("initial");
  return (
    <div>
      <span id="external">{external}</span>
      <ControlledChild external={external} onExternalChange={setExternal} />
      <button
        id="btn-from-external"
        onClick={() => setExternal("from-external")}
      >
        Set via external
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("uncontrolled: renders the default value", () => {
    const html = renderToStaticMarkup(<UncontrolledWrapper />);
    expect(html).toContain("default");
  });

  test("controlled: renders the parent value", () => {
    const html = renderToStaticMarkup(<ControlledWrapper />);
    expect(html).toMatch(/<span [^>]*id="bound"[^>]*>initial<\/span>/);
  });
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR]", () => {
  test("uncontrolled: renders the default value", () => {
    const { container } = render(<UncontrolledWrapper />);
    expect(container.querySelector("#bound")!.textContent).toBe("default");
  });

  test("uncontrolled: writes via the returned setter update the display", () => {
    const { container } = render(<UncontrolledWrapper />);

    fireEvent.click(container.querySelector("#btn-set")!);

    expect(container.querySelector("#bound")!.textContent).toBe("from-bound");
  });

  test("controlled: parent's value is the source of truth", () => {
    const { container } = render(<ControlledWrapper />);
    expect(container.querySelector("#external")!.textContent).toBe("initial");
    expect(container.querySelector("#bound")!.textContent).toBe("initial");
  });

  test("controlled: writes from the child propagate to the parent", () => {
    const { container } = render(<ControlledWrapper />);

    fireEvent.click(container.querySelector("#btn-from-bound")!);

    expect(container.querySelector("#bound")!.textContent).toBe("from-bound");
    expect(container.querySelector("#external")!.textContent).toBe(
      "from-bound",
    );
  });

  test("controlled: writes from the parent propagate to the child", () => {
    const { container } = render(<ControlledWrapper />);

    fireEvent.click(container.querySelector("#btn-from-external")!);

    expect(container.querySelector("#external")!.textContent).toBe(
      "from-external",
    );
    expect(container.querySelector("#bound")!.textContent).toBe(
      "from-external",
    );
  });
});
