import { $, component$, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmAgUiPromptPicker } from "./elm-ag-ui-prompt-picker";

// ElmAgUiPromptPicker renders each prompt row with a per-iteration inline
// `onClick$={() => onRowClick$(p)}` inside `prompts.map(...)` — the exact
// QRL-in-iteration shape that createDOM can't validate (it doesn't run the
// real optimizer). This real-browser spec drives an actual row click and
// asserts the pick flow fires, proving the per-row handler resolves under the
// optimizer. See [[feedback_qwik_qrl_in_jsx_iteration]] and the elm-select
// browser spec.
//
// Harness state is surfaced through a hidden <output> rather than a captured
// module const — the lazy QRL segment would otherwise re-import this spec
// module mid-test. `prompts` is built inline in the component for the same
// reason; `onPick$` is created with `$()` inside the component.

describe("[CSR] ElmAgUiPromptPicker — row click resolves the per-iteration handler", () => {
  test("clicking a no-arg prompt fires onPick$ immediately (no modal)", async () => {
    const Harness = component$(() => {
      const picked = useSignal<string>("");
      const onPick$ = $((key: string) => {
        picked.value = key;
      });
      return (
        <div>
          <output data-testid="picked">{picked.value}</output>
          <ElmAgUiPromptPicker
            onPick$={onPick$}
            prompts={[
              { key: "greet", name: "Greet" },
              { key: "farewell", name: "Farewell" },
            ]}
          />
        </div>
      );
    });

    const screen = await render(<Harness />);

    // Click the second row — if the per-iteration handler failed to resolve,
    // `onPick$` would never fire and the binding would stay empty.
    await screen.getByText("Farewell").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("picked").element().textContent).toBe(
        "farewell",
      ),
    );
  });

  test("clicking an arg-bearing prompt opens the modal, then submit fires onPick$ with the typed value", async () => {
    const Harness = component$(() => {
      const pickedKey = useSignal<string>("");
      const pickedArg = useSignal<string>("");
      const onPick$ = $((key: string, args: Record<string, string>) => {
        pickedKey.value = key;
        pickedArg.value = args["name"] ?? "";
      });
      return (
        <div>
          <output data-testid="key">{pickedKey.value}</output>
          <output data-testid="arg">{pickedArg.value}</output>
          <ElmAgUiPromptPicker
            onPick$={onPick$}
            prompts={[
              {
                key: "echo",
                name: "Echo",
                arguments: [{ name: "name", required: true }],
              },
            ]}
          />
        </div>
      );
    });

    const screen = await render(<Harness />);

    // Open the modal for the arg-bearing row.
    await screen.getByText("Echo").click();

    // The modal's first field is focused on open; type into it. The submit /
    // cancel controls live inside the <dialog> (top layer), so they remain
    // clickable while the modal blocks pointer events to the rows behind it.
    const input = screen.getByRole("textbox");
    await input.fill("Ada");

    await screen.getByText("Use prompt").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("key").element().textContent).toBe("echo"),
    );
    await vi.waitFor(() =>
      expect(screen.getByTestId("arg").element().textContent).toBe("Ada"),
    );
  });

  test("a required-but-empty field blocks submit with an inline error", async () => {
    const Harness = component$(() => {
      const pickedKey = useSignal<string>("");
      const onPick$ = $((key: string) => {
        pickedKey.value = key;
      });
      return (
        <div>
          <output data-testid="key">{pickedKey.value}</output>
          <ElmAgUiPromptPicker
            onPick$={onPick$}
            prompts={[
              {
                key: "echo",
                name: "Echo",
                arguments: [{ name: "name", required: true }],
              },
            ]}
          />
        </div>
      );
    });

    const screen = await render(<Harness />);

    await screen.getByText("Echo").click();
    // Submit without filling the required field.
    await screen.getByText("Use prompt").click();

    // The missing-required guard surfaces an inline error and never calls
    // onPick$.
    await expect.element(screen.getByText('"name" is required.')).toBeVisible();
    expect(screen.getByTestId("key").element().textContent).toBe("");
  });
});
