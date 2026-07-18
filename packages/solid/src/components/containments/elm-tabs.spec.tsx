import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import styles from "./elm-tabs.module.css";
import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";

const SampleTabs = (props: { defaultValue?: string }) => (
  <ElmTabs defaultValue={props.defaultValue ?? "tab1"}>
    <ElmTabList>
      <ElmTab value="tab1">Tab 1</ElmTab>
      <ElmTab value="tab2">Tab 2</ElmTab>
      <ElmTab value="tab3">Tab 3</ElmTab>
    </ElmTabList>
    <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
    <ElmTabPanel value="tab2">Content 2</ElmTabPanel>
    <ElmTabPanel value="tab3">Content 3</ElmTabPanel>
  </ElmTabs>
);

describe("[CSR] ElmTabs", () => {
  it("renders every tab label and panel content", () => {
    const { container } = render(() => <SampleTabs />);

    expect(container).toHaveTextContent("Tab 1");
    expect(container).toHaveTextContent("Tab 2");
    expect(container).toHaveTextContent("Tab 3");
    expect(container).toHaveTextContent("Content 1");
    expect(container).toHaveTextContent("Content 2");
    expect(container).toHaveTextContent("Content 3");
  });

  it("selects and switches the uncontrolled value", () => {
    const { getByText } = render(() => <SampleTabs defaultValue="tab3" />);

    expect(getByText("Tab 3")).toHaveClass(styles.active);
    expect(getByText("Tab 1")).not.toHaveClass(styles.active);

    fireEvent.click(getByText("Tab 2"));

    expect(getByText("Tab 2")).toHaveClass(styles.active);
    expect(getByText("Tab 3")).not.toHaveClass(styles.active);
  });

  it("treats an empty string as controlled and waits for its parent to update", () => {
    const onValueChange = vi.fn();
    const { getByText } = render(() => (
      <ElmTabs value="" onValueChange={onValueChange}>
        <ElmTabList>
          <ElmTab value="">Empty</ElmTab>
          <ElmTab value="next">Next</ElmTab>
        </ElmTabList>
        <ElmTabPanel value="">Empty content</ElmTabPanel>
        <ElmTabPanel value="next">Next content</ElmTabPanel>
      </ElmTabs>
    ));

    expect(getByText("Empty")).toHaveClass(styles.active);
    fireEvent.click(getByText("Next"));

    expect(onValueChange).toHaveBeenCalledWith("next");
    expect(getByText("Empty")).toHaveClass(styles.active);
    expect(getByText("Next")).not.toHaveClass(styles.active);
  });

  it("reacts to parent-owned value, timing, and class updates", () => {
    const [value, setValue] = createSignal("first");
    const [linear, setLinear] = createSignal(true);
    const { getByTestId, getByText } = render(() => (
      <ElmTabs
        value={value()}
        class={linear() ? "linear-tabs" : "eased-tabs"}
        transitionTimingFunction={linear() ? "linear" : "ease-in"}
      >
        <ElmTabList>
          <ElmTab value="first">First</ElmTab>
          <ElmTab value="second">Second</ElmTab>
        </ElmTabList>
        <ElmTabPanel data-testid="first-panel" value="first">
          First content
        </ElmTabPanel>
        <ElmTabPanel data-testid="second-panel" value="second">
          Second content
        </ElmTabPanel>
      </ElmTabs>
    ));
    const root = getByText("First").parentElement!.parentElement!;

    expect(root).toHaveClass("linear-tabs");
    expect(getByText("First")).toHaveClass(styles.active);

    setValue("second");
    setLinear(false);

    expect(root).toHaveClass("eased-tabs");
    expect(root).not.toHaveClass("linear-tabs");
    expect(getByText("Second")).toHaveClass(styles.active);
    expect(getByTestId("second-panel").firstElementChild).toHaveStyle(
      "--elmethis-scoped-transition-timing-function: ease-in",
    );
  });

  it("forwards native props and refs without leaking semantic values", () => {
    let root: HTMLDivElement | undefined;
    let list: HTMLDivElement | undefined;
    let tab: HTMLDivElement | undefined;
    let panel: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmTabs
        ref={(element) => {
          root = element;
        }}
        data-testid="tabs"
        data-root="forwarded"
        class="custom-tabs"
        style={{ margin: "1rem" }}
        defaultValue="tab"
        transitionTimingFunction="linear"
      >
        <ElmTabList
          ref={(element) => {
            list = element;
          }}
          data-testid="list"
          class="custom-list"
        >
          <ElmTab
            ref={(element) => {
              tab = element;
            }}
            data-testid="tab"
            class="custom-tab"
            value="tab"
          >
            Tab
          </ElmTab>
        </ElmTabList>
        <ElmTabPanel
          ref={(element) => {
            panel = element;
          }}
          data-testid="panel"
          class="custom-panel"
          value="tab"
        >
          Content
        </ElmTabPanel>
      </ElmTabs>
    ));

    expect(getByTestId("tabs")).toBe(root);
    expect(getByTestId("list")).toBe(list);
    expect(getByTestId("tab")).toBe(tab);
    expect(getByTestId("panel")).toBe(panel);
    expect(root).toHaveClass("custom-tabs");
    expect(root?.style.margin).toBe("1rem");
    expect(root).toHaveAttribute("data-root", "forwarded");
    expect(root).not.toHaveAttribute("defaultValue");
    expect(root).not.toHaveAttribute("transitionTimingFunction");
    expect(tab).not.toHaveAttribute("value");
    expect(panel).not.toHaveAttribute("value");
  });

  it("changes value before composing the consumer tab click handler", () => {
    const calls: string[] = [];
    const onClick = vi.fn((label: string, event: MouseEvent) => {
      calls.push(label);
      expect(event.currentTarget).toHaveTextContent("Second");
    });
    const { getByText } = render(() => (
      <ElmTabs defaultValue="first" onValueChange={() => calls.push("change")}>
        <ElmTabList>
          <ElmTab value="first">First</ElmTab>
          <ElmTab onClick={[onClick, "click"]} value="second">
            Second
          </ElmTab>
        </ElmTabList>
        <ElmTabPanel value="first">First content</ElmTabPanel>
        <ElmTabPanel value="second">Second content</ElmTabPanel>
      </ElmTabs>
    ));

    fireEvent.click(getByText("Second"));

    expect(calls).toEqual(["change", "click"]);
    expect(onClick).toHaveBeenCalledOnce();
    expect(getByText("Second")).toHaveClass(styles.active);
  });
});
