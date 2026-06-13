import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmA2ui } from "./elm-a2ui";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

// ElmA2ui drives a `@a2ui/web_core` MessageProcessor and renders each surface
// through a ComponentHost tree. The processor builds in a `watch(immediate)`
// and the SDK resolves surfaces via its (microtask-based) EventEmitter, so CSR
// assertions wait for the surface to settle. SSR must render the wrapper
// without throwing.

const basicSurface = [
  { version: "v0.9", createSurface: { surfaceId: "s", catalogId: CATALOG_ID } },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "s",
      components: [
        { component: "Column", id: "root", children: ["title", "body"] },
        { component: "Text", id: "title", variant: "h2", text: "A2UI Title" },
        { component: "Text", id: "body", text: "Body paragraph." },
      ],
    },
  },
] as object[];

describe("[CSR] ElmA2ui", () => {
  it("renders a basic-catalog surface from a message list", async () => {
    const wrapper = mount(ElmA2ui, { props: { messages: basicSurface } });
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("A2UI Title");
    });
    expect(wrapper.text()).toContain("Body paragraph.");
  });

  it("maps a Text `variant` to a real heading element (h2, not raw text)", async () => {
    // The basic Text renderer maps `variant` directly to ElmHeading (qwik
    // behavior — no markdown layer), so an h2 variant resolves to an <h2>.
    const wrapper = mount(ElmA2ui, { props: { messages: basicSurface } });
    await vi.waitFor(() => {
      const heading = wrapper.find("h2");
      expect(heading.exists()).toBe(true);
      expect(heading.text()).toContain("A2UI Title");
    });
  });

  it("renders nothing harmful for an empty message list", () => {
    const wrapper = mount(ElmA2ui, { props: { messages: [] } });
    // The root wrapper exists; no surfaces.
    expect(wrapper.find("div").exists()).toBe(true);
    expect(wrapper.text()).toBe("");
  });

  it("shows the [Loading id…] placeholder for a child whose model hasn't arrived", async () => {
    const danglingChild = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "d", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "d",
          components: [
            // root references "ghost", which is never defined → its host
            // resolves no model and (having never seen one) shows the loader.
            { component: "Column", id: "root", children: ["ghost"] },
          ],
        },
      },
    ] as object[];
    const wrapper = mount(ElmA2ui, { props: { messages: danglingChild } });
    await vi.waitFor(() => {
      expect(wrapper.find('[data-a2ui-state="loading"]').exists()).toBe(true);
    });
    expect(wrapper.text()).toContain("[Loading ghost…]");
  });

  it("shows the Unknown-component placeholder for a type with no renderer", async () => {
    const unknownType = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "u", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "u",
          components: [
            { component: "NotARealComponent", id: "root", text: "x" },
          ],
        },
      },
    ] as object[];
    const wrapper = mount(ElmA2ui, { props: { messages: unknownType } });
    await vi.waitFor(() => {
      expect(wrapper.find('[data-a2ui-state="unknown"]').exists()).toBe(true);
    });
    expect(wrapper.text()).toContain("Unknown component: NotARealComponent");
  });
});

describe("[SSR] ElmA2ui", () => {
  it("renders the wrapper without throwing", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmA2ui, { messages: basicSurface }) }),
    );
    expect(typeof html).toBe("string");
    expect(html).toContain("<div");
  });
});
