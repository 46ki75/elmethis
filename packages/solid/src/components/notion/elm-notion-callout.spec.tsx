import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import {
  ElmNotionCallout,
  type NotionCalloutColor,
  type NotionCalloutIcon,
  type NotionCalloutVariant,
} from "./elm-notion-callout";

describe("[CSR] ElmNotionCallout", () => {
  it("reactively renders variants and icons while forwarding native props", () => {
    const [icon, setIcon] = createSignal<NotionCalloutIcon>();
    const [color, setColor] = createSignal<NotionCalloutColor>();
    const [variant, setVariant] = createSignal<NotionCalloutVariant>();
    let root: HTMLDivElement | undefined;
    const { container, getByTestId } = render(() => (
      <ElmNotionCallout
        ref={(element) => {
          root = element;
        }}
        icon={icon()}
        color={color()}
        variant={variant()}
        class="custom-callout"
        data-testid="notion-callout"
        aria-label="Notion callout"
      >
        callout body
      </ElmNotionCallout>
    ));
    const callout = getByTestId("notion-callout");

    expect(callout).toBe(root);
    expect(callout).toHaveTextContent("callout body");
    expect(callout).toHaveClass("custom-callout");
    expect(callout.className).toMatch(/gray/);
    expect(callout.className).toMatch(/filled/);
    expect(container.querySelector("[role='img']")).toBeNull();

    setIcon({ kind: "emoji", emoji: "info" });
    setColor("blue");
    setVariant("outlined");

    expect(container.querySelector("[role='img']")).toHaveTextContent("info");
    expect(callout.className).toMatch(/blue/);
    expect(callout.className).toMatch(/outlined/);

    setIcon({ kind: "image", src: "/icon.png", alt: "icon" });
    expect(container.querySelector("[role='img']")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", "/icon.png");
    expect(container.querySelector("img")).toHaveAttribute("alt", "icon");
  });
});
