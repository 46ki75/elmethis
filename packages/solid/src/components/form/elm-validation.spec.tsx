import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmValidation } from "./elm-validation";

describe("[CSR] ElmValidation", () => {
  it("forwards native props and a ref while keeping semantic props private", () => {
    const onClick = vi.fn();
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmValidation
        ref={(element) => {
          root = element;
        }}
        text="Must be 8+ characters"
        isValid={false}
        class="custom-validation"
        data-testid="validation"
        aria-label="Password requirement"
        onClick={onClick}
      />
    ));
    const validation = getByTestId("validation");

    expect(validation).toBe(root);
    expect(validation).toHaveClass("custom-validation");
    expect(validation).toHaveAttribute("aria-label", "Password requirement");
    expect(validation).not.toHaveAttribute("isValid");
    expect(validation).not.toHaveAttribute("validColor");
    expect(validation.querySelector("svg")).toHaveAttribute("role", "img");

    fireEvent.click(validation);
    expect(onClick).toHaveBeenCalledOnce();
  });

  /* eslint-disable solid/style-prop -- This verifies native string-style passthrough. */
  it("merges object and string styles after the scoped opacity default", () => {
    const { getByTestId } = render(() => (
      <>
        <ElmValidation
          data-testid="object-style"
          text="object"
          isValid={false}
          style={{ "--elmethis-scoped-opacity": 0.25, gap: "1rem" }}
        />
        <ElmValidation
          data-testid="string-style"
          text="string"
          isValid
          style="--elmethis-scoped-opacity:0.75;gap:2rem"
        />
      </>
    ));

    expect(
      getByTestId("object-style").style.getPropertyValue(
        "--elmethis-scoped-opacity",
      ),
    ).toBe("0.25");
    expect(getByTestId("object-style")).toHaveStyle({ gap: "1rem" });
    expect(
      getByTestId("string-style").style.getPropertyValue(
        "--elmethis-scoped-opacity",
      ),
    ).toBe("0.75");
    expect(getByTestId("string-style")).toHaveStyle({ gap: "2rem" });
  });
  /* eslint-enable solid/style-prop */

  it("reactively updates validity, text, class, color, opacity, and icon", () => {
    const [valid, setValid] = createSignal(false);
    const [text, setText] = createSignal("Pending");
    const { getByTestId } = render(() => (
      <ElmValidation
        data-testid="validation"
        class={valid() ? "valid" : "invalid"}
        text={text()}
        isValid={valid()}
        validColor="rgb(10, 20, 30)"
      />
    ));
    const validation = getByTestId("validation");
    const icon = validation.querySelector("svg")!;
    const initialPath = icon.querySelector("path")!.getAttribute("d");

    expect(validation).toHaveClass("invalid");
    expect(validation).toHaveTextContent("Pending");
    expect(validation.style.getPropertyValue("--elmethis-scoped-opacity")).toBe(
      "0.5",
    );

    setText("Looks good");
    setValid(true);

    expect(validation).toHaveClass("valid");
    expect(validation).not.toHaveClass("invalid");
    expect(validation).toHaveTextContent("Looks good");
    expect(validation.style.getPropertyValue("--elmethis-scoped-opacity")).toBe(
      "1",
    );
    expect(icon.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "rgb(10, 20, 30)",
    );
    expect(icon.querySelector("path")!.getAttribute("d")).not.toBe(initialPath);
  });
});
