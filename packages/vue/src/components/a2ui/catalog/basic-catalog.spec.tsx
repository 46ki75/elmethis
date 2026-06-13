import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { ElmA2ui } from "../elm-a2ui";

// Structural coverage of the basic-catalog renderers, plus genuine write-back
// round-trips. Each case is driven through the real ElmA2ui pipeline (default
// catalog = basicCatalog). Surface resolution is async (the SDK's microtask
// emitter), so assertions wait. The write-back tests dispatch real input/change
// events — happy-dom services these, so `setBinding` → dataModel → re-render is
// exercised end-to-end without a browser layer.

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const mountSurface = (
  components: object[],
  dataModel: Record<string, unknown> = {},
) => {
  const messages: object[] = [
    {
      version: "v0.9",
      createSurface: { surfaceId: "s", catalogId: CATALOG_ID },
    },
  ];
  for (const [path, value] of Object.entries(dataModel)) {
    messages.push({
      version: "v0.9",
      updateDataModel: { surfaceId: "s", path, value },
    });
  }
  messages.push({
    version: "v0.9",
    updateComponents: { surfaceId: "s", components },
  });
  return mount(ElmA2ui, { props: { messages } });
};

describe("basicCatalog — Text", () => {
  it("body variant renders a <p>", async () => {
    const wrapper = mountSurface([
      { component: "Text", id: "root", text: "hi" },
    ]);
    await vi.waitFor(() => expect(wrapper.find("p").exists()).toBe(true));
  });

  it("h2 variant renders a heading", async () => {
    const wrapper = mountSurface([
      { component: "Text", id: "root", variant: "h2", text: "Title" },
    ]);
    await vi.waitFor(() => expect(wrapper.find("h2").exists()).toBe(true));
  });

  it("resolves a path binding from the data model", async () => {
    const wrapper = mountSurface(
      [{ component: "Text", id: "root", text: { path: "/user/name" } }],
      { "/user/name": "Ada" },
    );
    await vi.waitFor(() => expect(wrapper.text()).toContain("Ada"));
  });
});

describe("basicCatalog — structure", () => {
  it("Button renders a clickable role=button", async () => {
    const wrapper = mountSurface([
      { component: "Button", id: "root", child: "c" },
      { component: "Text", id: "c", variant: "caption", text: "Go" },
    ]);
    await vi.waitFor(() => {
      const btn = wrapper.find('[role="button"]');
      expect(btn.exists()).toBe(true);
      expect(btn.text()).toContain("Go");
    });
  });

  it("Image uses the resolved url", async () => {
    const wrapper = mountSurface([
      {
        component: "Image",
        id: "root",
        url: "https://example.test/a.png",
        fit: "contain",
      },
    ]);
    await vi.waitFor(() => {
      const img = wrapper.find("img");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.test/a.png");
    });
  });

  it("List with horizontal direction adds the horizontal class", async () => {
    const wrapper = mountSurface([
      {
        component: "List",
        id: "root",
        direction: "horizontal",
        children: ["a"],
      },
      { component: "Text", id: "a", text: "x" },
    ]);
    await vi.waitFor(() =>
      expect(wrapper.find('[class*="list-horizontal"]').exists()).toBe(true),
    );
  });

  it("Card renders its single child", async () => {
    const wrapper = mountSurface([
      { component: "Card", id: "root", child: "c" },
      { component: "Text", id: "c", text: "inside the card" },
    ]);
    await vi.waitFor(() => expect(wrapper.text()).toContain("inside the card"));
  });

  it("Icon exposes the resolved name via aria-label / data-icon", async () => {
    const wrapper = mountSurface([
      { component: "Icon", id: "root", name: "star" },
    ]);
    await vi.waitFor(() => {
      const icon = wrapper.find('[data-icon="star"]');
      expect(icon.exists()).toBe(true);
      expect(icon.attributes("aria-label")).toBe("star");
    });
  });
});

describe("basicCatalog — form fields", () => {
  it("TextField renders an <input> with the resolved value", async () => {
    const wrapper = mountSurface(
      [
        {
          component: "TextField",
          id: "root",
          label: "Name",
          value: { path: "/name" },
        },
      ],
      { "/name": "Ada" },
    );
    await vi.waitFor(() => {
      const input = wrapper.find("input");
      expect(input.exists()).toBe(true);
      expect((input.element as HTMLInputElement).value).toBe("Ada");
    });
  });

  it("CheckBox reflects a boolean path binding", async () => {
    const wrapper = mountSurface(
      [
        {
          component: "CheckBox",
          id: "root",
          label: "Agree",
          value: { path: "/agree" },
        },
      ],
      { "/agree": true },
    );
    await vi.waitFor(() => {
      const cb = wrapper.find('input[type="checkbox"]');
      expect(cb.exists()).toBe(true);
      expect((cb.element as HTMLInputElement).checked).toBe(true);
    });
  });

  it("Slider passes min/max and a numeric value", async () => {
    const wrapper = mountSurface([
      { component: "Slider", id: "root", min: 0, max: 100, value: 42 },
    ]);
    await vi.waitFor(() => {
      const slider = wrapper.find('input[type="range"]');
      expect(slider.exists()).toBe(true);
      expect(slider.attributes("max")).toBe("100");
      expect((slider.element as HTMLInputElement).value).toBe("42");
    });
  });

  it("ChoicePicker single-select uses radio inputs", async () => {
    const wrapper = mountSurface([
      {
        component: "ChoicePicker",
        id: "root",
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      },
    ]);
    await vi.waitFor(() =>
      expect(wrapper.find('input[type="radio"]').exists()).toBe(true),
    );
  });

  it("ChoicePicker multipleSelection uses checkboxes", async () => {
    const wrapper = mountSurface([
      {
        component: "ChoicePicker",
        id: "root",
        variant: "multipleSelection",
        options: [{ value: "a", label: "A" }],
      },
    ]);
    await vi.waitFor(() =>
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true),
    );
  });
});

describe("basicCatalog — write-back round-trip", () => {
  it("typing in a TextField updates a sibling bound to the same path", async () => {
    // field + echo both bind /name; typing into the field must flow through
    // setBinding -> dataModel -> the host's dataModel subscription -> re-render
    // of the echo Text.
    const wrapper = mountSurface(
      [
        { component: "Column", id: "root", children: ["field", "echo"] },
        {
          component: "TextField",
          id: "field",
          label: "Name",
          value: { path: "/name" },
        },
        { component: "Text", id: "echo", text: { path: "/name" } },
      ],
      { "/name": "ada" },
    );
    await vi.waitFor(() => expect(wrapper.text()).toContain("ada"));

    await wrapper.find("input").setValue("grace");

    await vi.waitFor(() => expect(wrapper.text()).toContain("grace"));
  });

  it("toggling a CheckBox propagates through the data model to a paired CheckBox", async () => {
    const wrapper = mountSurface(
      [
        { component: "Column", id: "root", children: ["c1", "c2"] },
        {
          component: "CheckBox",
          id: "c1",
          label: "one",
          value: { path: "/agree" },
        },
        {
          component: "CheckBox",
          id: "c2",
          label: "two",
          value: { path: "/agree" },
        },
      ],
      { "/agree": false },
    );
    await vi.waitFor(() =>
      expect(wrapper.findAll('input[type="checkbox"]').length).toBe(2),
    );

    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(true);

    await vi.waitFor(() => {
      const second = wrapper.findAll('input[type="checkbox"]')[1]!;
      expect((second.element as HTMLInputElement).checked).toBe(true);
    });
  });
});
