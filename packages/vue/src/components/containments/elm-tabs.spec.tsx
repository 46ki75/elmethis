import { describe, it, expect, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";
import { ElmParagraph } from "../typography/elm-paragraph";

const SampleTabs = defineComponent({
  name: "SampleTabs",
  props: { defaultValue: { type: String, default: "tab1" } },
  setup(props) {
    return () => (
      <ElmTabs defaultValue={props.defaultValue}>
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
  },
});

const activeTab = (wrapper: VueWrapper, label: string) => {
  const el = wrapper
    .findAll("div")
    .find(
      (node) => node.text() === label && /tab/.test(node.classes().join(" ")),
    );
  if (!el) throw new Error(`Tab not found: ${label}`);
  return el;
};

const isActive = (el: ReturnType<typeof activeTab>) =>
  /active/.test(el.classes().join(" "));

describe("[CSR] ElmTabs", () => {
  it("renders every tab label and panel content", () => {
    const wrapper = mount(SampleTabs);
    const html = wrapper.html();
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
    const wrapper = mount(SampleTabs, { props: { defaultValue: "tab3" } });
    expect(isActive(activeTab(wrapper, "Tab 3"))).toBe(true);
    expect(isActive(activeTab(wrapper, "Tab 1"))).toBe(false);
  });

  it("clicking a tab switches the active tab (uncontrolled)", async () => {
    const wrapper = mount(SampleTabs);
    expect(isActive(activeTab(wrapper, "Tab 1"))).toBe(true);

    await activeTab(wrapper, "Tab 2").trigger("click");
    expect(isActive(activeTab(wrapper, "Tab 2"))).toBe(true);
    expect(isActive(activeTab(wrapper, "Tab 1"))).toBe(false);
  });

  it("emits update:value and reflects a controlled value", async () => {
    const onValueChange = vi.fn();

    const Controlled = defineComponent({
      name: "Controlled",
      setup() {
        const value = ref("tab1");
        const onUpdate = (next: string) => {
          onValueChange(next);
          value.value = next;
        };
        return () => (
          <ElmTabs value={value.value} {...{ "onUpdate:value": onUpdate }}>
            <ElmTabList>
              <ElmTab value="tab1">Tab 1</ElmTab>
              <ElmTab value="tab2">Tab 2</ElmTab>
            </ElmTabList>
            <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
            <ElmTabPanel value="tab2">Content 2</ElmTabPanel>
          </ElmTabs>
        );
      },
    });

    const wrapper = mount(Controlled);
    expect(isActive(activeTab(wrapper, "Tab 1"))).toBe(true);

    await activeTab(wrapper, "Tab 2").trigger("click");
    expect(onValueChange).toHaveBeenCalledWith("tab2");
    expect(isActive(activeTab(wrapper, "Tab 2"))).toBe(true);
    expect(isActive(activeTab(wrapper, "Tab 1"))).toBe(false);
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmTabs, {
      props: { defaultValue: "tab1" },
      attrs: { class: "custom-class" },
      slots: {
        default: () => [
          h(ElmTabList, null, {
            default: () => h(ElmTab, { value: "tab1" }, () => "Tab 1"),
          }),
          h(ElmTabPanel, { value: "tab1" }, () => "Content 1"),
        ],
      },
    });
    expect(wrapper.find('[class*="elm-tabs"]').classes()).toContain(
      "custom-class",
    );
  });
});

describe("[SSR] ElmTabs", () => {
  it("renders tab labels and panel content server-side", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(SampleTabs) }),
    );
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
