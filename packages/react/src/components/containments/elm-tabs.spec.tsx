import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";

import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";
import { ElmParagraph } from "../typography/elm-paragraph";

const SampleTabs = ({ defaultValue = "tab1" }: { defaultValue?: string }) => (
  <ElmTabs defaultValue={defaultValue}>
    <ElmTabList>
      <ElmTab value="tab1">Tab 1</ElmTab>
      <ElmTab value="tab2">Tab 2</ElmTab>
      <ElmTab value="tab3">Tab 3</ElmTab>
    </ElmTabList>

    <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
    <ElmTabPanel value="tab2">Content 2</ElmTabPanel>
    <ElmTabPanel value="tab3">
      <ElmParagraph>Content 3-A</ElmParagraph>
      <ElmParagraph>Content 3-B</ElmParagraph>
      <ElmParagraph>Content 3-C</ElmParagraph>
    </ElmTabPanel>
  </ElmTabs>
);

const activeTab = (container: HTMLElement, label: string) => {
  const el = Array.from(container.querySelectorAll<HTMLElement>("div")).find(
    (node) => node.textContent === label && /tab/.test(node.className),
  );
  if (!el) throw new Error(`Tab not found: ${label}`);
  return el;
};

const isActive = (el: HTMLElement) => /active/.test(el.className);

describe("[CSR] ElmTabs", () => {
  it("renders every tab label and panel content", () => {
    const { container } = render(<SampleTabs />);
    const html = container.innerHTML;
    expect(html).toContain("Tab 1");
    expect(html).toContain("Tab 2");
    expect(html).toContain("Tab 3");
    expect(html).toContain("Content 1");
    expect(html).toContain("Content 2");
    expect(html).toContain("Content 3-A");
    expect(html).toContain("Content 3-B");
    expect(html).toContain("Content 3-C");
  });

  it("marks the defaultValue tab active (uncontrolled)", () => {
    const { container } = render(<SampleTabs defaultValue="tab3" />);
    expect(isActive(activeTab(container, "Tab 3"))).toBe(true);
    expect(isActive(activeTab(container, "Tab 1"))).toBe(false);
  });

  it("clicking a tab switches the active tab (uncontrolled)", () => {
    const { container, getByText } = render(<SampleTabs />);
    expect(isActive(activeTab(container, "Tab 1"))).toBe(true);

    fireEvent.click(getByText("Tab 2"));
    expect(isActive(activeTab(container, "Tab 2"))).toBe(true);
    expect(isActive(activeTab(container, "Tab 1"))).toBe(false);
  });

  it("calls onValueChange and reflects a controlled value", () => {
    const onValueChange = vi.fn();

    const Controlled = () => {
      const [value, setValue] = useState("tab1");
      return (
        <ElmTabs
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        >
          <ElmTabList>
            <ElmTab value="tab1">Tab 1</ElmTab>
            <ElmTab value="tab2">Tab 2</ElmTab>
          </ElmTabList>
          <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
          <ElmTabPanel value="tab2">Content 2</ElmTabPanel>
        </ElmTabs>
      );
    };

    const { container, getByText } = render(<Controlled />);
    expect(isActive(activeTab(container, "Tab 1"))).toBe(true);

    fireEvent.click(getByText("Tab 2"));
    expect(onValueChange).toHaveBeenCalledWith("tab2");
    expect(isActive(activeTab(container, "Tab 2"))).toBe(true);
    expect(isActive(activeTab(container, "Tab 1"))).toBe(false);
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmTabs className="custom-class" defaultValue="tab1">
        <ElmTabList>
          <ElmTab value="tab1">Tab 1</ElmTab>
        </ElmTabList>
        <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
      </ElmTabs>,
    );
    expect(container.firstElementChild).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmTabs", () => {
  it("renders tab labels and panel content server-side", () => {
    const html = renderToStaticMarkup(<SampleTabs />);
    expect(html).toContain("Tab 1");
    expect(html).toContain("Tab 2");
    expect(html).toContain("Tab 3");
    expect(html).toContain("Content 1");
    expect(html).toContain("Content 2");
    expect(html).toContain("Content 3-A");
    expect(html).toContain("Content 3-B");
    expect(html).toContain("Content 3-C");
  });
});
