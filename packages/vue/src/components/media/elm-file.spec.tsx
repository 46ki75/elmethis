import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmFile } from "./elm-file";

// ElmFile renders a file card: a file icon, a name (explicit `name` prop or the
// last path segment of `src`), an optional filesize, and a download affordance.
// The actual download (fetch -> blob -> anchor.click) lives behind a click and
// touches network/Blob APIs, so the unit layer covers rendering only.

describe("[CSR] ElmFile", () => {
  it("renders the explicit name when provided", () => {
    const wrapper = mount(ElmFile, {
      props: { name: "report.pdf", src: "https://example.com/files/x.pdf" },
    });

    expect(wrapper.find('[class*="elm-file"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("report.pdf");
  });

  it("derives the filename from the src's last path segment when name is absent", () => {
    const wrapper = mount(ElmFile, {
      props: { src: "https://example.com/files/photo.png?token=1" },
    });

    // Query/hash are stripped; the last segment is used.
    expect(wrapper.text()).toContain("photo.png");
  });

  it("renders the filesize when supplied", () => {
    const wrapper = mount(ElmFile, {
      props: {
        name: "a.zip",
        src: "https://example.com/a.zip",
        filesize: "2 MB",
      },
    });

    expect(wrapper.find('[class*="file-size"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("2 MB");
  });

  it("renders a download affordance with an icon", () => {
    const wrapper = mount(ElmFile, {
      props: { name: "a.zip", src: "https://example.com/a.zip" },
    });

    const download = wrapper.find('[class*="download-icon"]');
    expect(download.exists()).toBe(true);
    expect(download.find("svg").exists()).toBe(true);
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmFile, {
      props: { name: "a.zip", src: "https://example.com/a.zip" },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find('[class*="elm-file"]').classes()).toContain(
      "custom-class",
    );
  });
});

describe("[SSR] ElmFile", () => {
  it("server HTML emits the file card with the resolved name", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmFile, { src: "https://example.com/files/photo.png" }),
      }),
    );
    expect(html).toContain("elm-file");
    expect(html).toContain("photo.png");
  });
});
