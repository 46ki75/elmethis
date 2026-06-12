import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmValidation } from "./elm-validation";

describe("[CSR] ElmValidation", () => {
  test("renders the validation text and an icon", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmValidation text="Must be 8+ chars" isValid={false} />);
    expect(screen.outerHTML).toContain("Must be 8+ chars");
    // ElmMdiIcon renders as an <svg>.
    expect(screen.outerHTML.toLowerCase()).toContain("<svg");
  });

  test("invalid state dims the row via the scoped opacity variable", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmValidation text="Pending" isValid={false} />);
    expect(screen.outerHTML).toContain("--elmethis-scoped-opacity:0.5");
  });

  test("valid state renders at full opacity", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmValidation text="Looks good" isValid />);
    expect(screen.outerHTML).toContain("--elmethis-scoped-opacity:1");
  });
});

describe("[SSR] ElmValidation", () => {
  test("renders the text in the server shell", async () => {
    const renderResult = await renderToString(
      <ElmValidation text="Server-checked" isValid />,
      { containerTagName: "div" },
    );
    expect(renderResult.html).toContain("Server-checked");
  });
});
