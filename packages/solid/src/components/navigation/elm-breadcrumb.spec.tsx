import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmBreadcrumb, type ElmBreadcrumbProps } from "./elm-breadcrumb";

describe("[CSR] ElmBreadcrumb", () => {
  it("renders each item and n-1 separators", () => {
    const { container } = render(() => (
      <ElmBreadcrumb
        links={[{ text: "Home" }, { text: "Docs" }, { text: "Page" }]}
      />
    ));

    expect(
      container.querySelectorAll('[class*="link-container"]'),
    ).toHaveLength(3);
    expect(container.querySelectorAll('[class*="chevron"]')).toHaveLength(2);
    expect(container).toHaveTextContent("Home");
    expect(container).toHaveTextContent("Docs");
    expect(container).toHaveTextContent("Page");
  });

  it("renders a single item without a separator", () => {
    const { container } = render(() => (
      <ElmBreadcrumb links={[{ text: "Only" }]} />
    ));

    expect(
      container.querySelectorAll('[class*="link-container"]'),
    ).toHaveLength(1);
    expect(container.querySelectorAll('[class*="chevron"]')).toHaveLength(0);
  });

  it("preserves item identity when links reorder and calls the correct handler", () => {
    const onHomeClick = vi.fn();
    let docsCurrentTarget: EventTarget | null = null;
    const onDocsClick = vi.fn((event: MouseEvent) => {
      docsCurrentTarget = event.currentTarget;
    });
    const home: ElmBreadcrumbProps["links"][number] = {
      text: "Home",
      onClick: onHomeClick,
    };
    const docs: ElmBreadcrumbProps["links"][number] = {
      text: "Docs",
      onClick: onDocsClick,
    };
    const [links, setLinks] = createSignal([home, docs]);
    const { container } = render(() => <ElmBreadcrumb links={links()} />);
    const initialItems = Array.from(
      container.querySelectorAll<HTMLElement>('[class*="link-container"]'),
    );

    initialItems[1]!.click();
    expect(onDocsClick).toHaveBeenCalledOnce();
    expect(onDocsClick.mock.calls[0]![0]).toBeInstanceOf(MouseEvent);
    expect(docsCurrentTarget).toBe(initialItems[1]);

    setLinks([docs, home]);

    const reorderedItems = Array.from(
      container.querySelectorAll<HTMLElement>('[class*="link-container"]'),
    );
    expect(reorderedItems[0]).toBe(initialItems[1]);
    expect(reorderedItems[1]).toBe(initialItems[0]);
    reorderedItems[1]!.click();
    expect(onHomeClick).toHaveBeenCalledOnce();
  });

  it("merges class and forwards native attributes and refs to the nav", () => {
    let root: HTMLElement | undefined;
    const { getByRole } = render(() => (
      <ElmBreadcrumb
        ref={(element) => {
          root = element;
        }}
        links={[{ text: "Home" }]}
        class="custom-breadcrumb"
        aria-label="Breadcrumb"
        data-navigation="breadcrumb"
      />
    ));

    const nav = getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBe(root);
    expect(nav).toHaveClass("custom-breadcrumb");
    expect(nav).toHaveAttribute("data-navigation", "breadcrumb");
  });
});
