import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";

import { ElmAgUiInput } from "./elm-ag-ui-input";
import styles from "./elm-ag-ui-input.module.css";

const resolvePrompt = () => Promise.resolve(null);

describe("[Browser] ElmAgUiInput", () => {
  it("does not reserve vertical space for the closed prompt picker", () => {
    const rendered = render(() => (
      <ElmAgUiInput
        isRunning={false}
        onInputChange={() => undefined}
        onSubmit={() => undefined}
        onAbort={() => undefined}
        prompts={[
          {
            key: "weather::forecast",
            name: "Forecast",
            description: "Create a detailed weather forecast for a location.",
          },
        ]}
        resolvePrompt={resolvePrompt}
        style={{ "--elmethis-scoped-collapse-transition-duration": "0ms" }}
      />
    ));
    const picker = rendered.container.querySelector<HTMLElement>(
      `.${styles["picker-container"]}`,
    );

    expect(picker).not.toBeNull();
    expect(picker?.getBoundingClientRect().height).toBe(0);

    rendered.getByRole("button", { name: "Open prompts" }).click();

    expect(picker?.getBoundingClientRect().height).toBeGreaterThan(0);
  });
});
