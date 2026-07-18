import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmTextField } from "./elm-text-field";

const EventHarness = () => {
  const [live, setLive] = createSignal("");
  const [committed, setCommitted] = createSignal("none");

  return (
    <div>
      <ElmTextField
        data-testid="field"
        aria-label="Name"
        label="Name"
        value={live()}
        onInput={(event) => setLive(event.currentTarget.value)}
        onChange={(event) => setCommitted(event.currentTarget.value)}
      />
      <output data-testid="live">{live()}</output>
      <output data-testid="committed">{committed()}</output>
      <button type="button">Outside</button>
    </div>
  );
};

describe("[Browser] ElmTextField", () => {
  it("keeps live input distinct from committed change and clears natively", async () => {
    const rendered = render(() => <EventHarness />);
    const screen = page.elementLocator(rendered.baseElement);
    const field = screen.getByTestId("field");

    await field.fill("Ada");
    await expect.element(screen.getByTestId("live")).toHaveTextContent("Ada");
    await expect
      .element(screen.getByTestId("committed"))
      .toHaveTextContent("none");

    await screen.getByRole("button", { name: "Outside" }).click();
    await expect
      .element(screen.getByTestId("committed"))
      .toHaveTextContent("Ada");

    await screen.getByRole("button", { name: "Clear text" }).click();
    await expect.element(field).toHaveValue("");
    await expect.element(screen.getByTestId("live")).toHaveTextContent("");
  });

  it("uses non-submitting buttons for password visibility and clear", async () => {
    const [submits, setSubmits] = createSignal(0);
    const rendered = render(() => (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmits((count) => count + 1);
        }}
      >
        <ElmTextField data-testid="password" label="Password" isPassword />
        <output data-testid="submits">{submits()}</output>
      </form>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const input = rendered.getByTestId("password") as HTMLInputElement;

    expect(input.type).toBe("password");
    await screen.getByRole("button", { name: "Show password" }).click();
    expect(input.type).toBe("text");
    await screen.getByRole("button", { name: "Clear text" }).click();
    await expect.element(screen.getByTestId("submits")).toHaveTextContent("0");
  });
});
