import { component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  ElmTab,
  ElmTabList,
  ElmTabPanel,
  ElmTabs,
  type ElmTabsProps,
} from "./elm-tabs";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmCodeBlock } from "../code/elm-code-block";

import code from "../code/seed/main.rs?raw";

// Resolve an ElmTab <div> via its label text. CSS-modules hash the class name
// but preserve the local name `tab` as a substring, so `[class*="tab"]` from
// the label's nearest ancestor matches the ElmTab wrapper first.
const getTab = (canvas: ReturnType<typeof within>, label: string) => {
  const el = canvas.getByText(label).closest('[class*="tab"]');
  if (!el) throw new Error(`Tab not found: ${label}`);
  return el as HTMLElement;
};

const isActive = (el: HTMLElement) => /active/.test(el.className);

const meta: Meta<ElmTabsProps> = {
  title: "Components/Containments/elm-tabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmTabsProps>;

const SampleTabs = component$<{ defaultValue?: string }>(
  ({ defaultValue = "tab1" }) => (
    <ElmTabs defaultValue={defaultValue}>
      <ElmTabList>
        <ElmTab value="tab1">
          <ElmInlineText>Tab 1</ElmInlineText>
        </ElmTab>
        <ElmTab value="tab2">
          <ElmInlineText>Tab 2</ElmInlineText>
        </ElmTab>
        <ElmTab value="tab3">
          <ElmInlineText>Tab 3</ElmInlineText>
        </ElmTab>
        <ElmTab value="code">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ElmLanguageIcon language="rust" size={16} />
            <ElmInlineText>Code</ElmInlineText>
          </span>
        </ElmTab>
      </ElmTabList>

      <ElmTabPanel value="tab1">
        <ElmInlineText>Content 1</ElmInlineText>
      </ElmTabPanel>
      <ElmTabPanel value="tab2">
        <ElmInlineText>Content 2</ElmInlineText>
      </ElmTabPanel>
      <ElmTabPanel value="tab3">
        <div style={{ "--margin-block": "32px" }}>
          <ElmParagraph>Content 3-A</ElmParagraph>
          <ElmParagraph>Content 3-B</ElmParagraph>
          <ElmParagraph>Content 3-C</ElmParagraph>
        </div>
      </ElmTabPanel>
      <ElmTabPanel value="code">
        <ElmCodeBlock language="rust" code={code} />
      </ElmTabPanel>
    </ElmTabs>
  ),
);

// Uncontrolled: the tabs manage the selected value internally.
export const Primary: Story = {
  render: () => <SampleTabs />,
};

export const DefaultSelected: Story = {
  render: () => <SampleTabs defaultValue="tab3" />,
};

// Controlled: parent owns the selected tab value.
const ControlledTabs = component$(() => {
  const selected = useSignal("tab1");
  const tabs = ["tab1", "tab2", "tab3", "code"] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        selected: {selected.value}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {tabs.map((value) => (
          <button key={value} onClick$={() => (selected.value = value)}>
            Go to {value}
          </button>
        ))}
      </div>

      <ElmTabs value={selected}>
        <ElmTabList>
          <ElmTab value="tab1">
            <ElmInlineText>Tab 1</ElmInlineText>
          </ElmTab>
          <ElmTab value="tab2">
            <ElmInlineText>Tab 2</ElmInlineText>
          </ElmTab>
          <ElmTab value="tab3">
            <ElmInlineText>Tab 3</ElmInlineText>
          </ElmTab>
          <ElmTab value="code">
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ElmLanguageIcon language="rust" size={16} />
              <ElmInlineText>Code</ElmInlineText>
            </span>
          </ElmTab>
        </ElmTabList>

        <ElmTabPanel value="tab1">
          <ElmInlineText>Content 1</ElmInlineText>
        </ElmTabPanel>
        <ElmTabPanel value="tab2">
          <ElmInlineText>Content 2</ElmInlineText>
        </ElmTabPanel>
        <ElmTabPanel value="tab3">
          <div style={{ "--margin-block": "32px" }}>
            <ElmParagraph>Content 3-A</ElmParagraph>
            <ElmParagraph>Content 3-B</ElmParagraph>
            <ElmParagraph>Content 3-C</ElmParagraph>
          </div>
        </ElmTabPanel>
        <ElmTabPanel value="code">
          <ElmCodeBlock language="rust" code={code} />
        </ElmTabPanel>
      </ElmTabs>
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledTabs />,
};

// ---------------------------------------------------------------------------
// Interaction tests. These exercise behavior via play functions and are
// excluded from autodocs to keep the Docs page focused on visual examples.
// ---------------------------------------------------------------------------

export const UncontrolledClickTest: Story = {
  name: "Test: click switches active tab (uncontrolled)",
  tags: ["!autodocs"],
  render: () => <SampleTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab1 = getTab(canvas, "Tab 1");
    const tab2 = getTab(canvas, "Tab 2");
    const tab3 = getTab(canvas, "Tab 3");

    await expect(isActive(tab1)).toBe(true);
    await expect(isActive(tab2)).toBe(false);

    await userEvent.click(canvas.getByText("Tab 2"));

    await waitFor(() => {
      expect(isActive(tab1)).toBe(false);
      expect(isActive(tab2)).toBe(true);
      expect(isActive(tab3)).toBe(false);
    });

    await userEvent.click(canvas.getByText("Tab 3"));

    await waitFor(() => {
      expect(isActive(tab1)).toBe(false);
      expect(isActive(tab2)).toBe(false);
      expect(isActive(tab3)).toBe(true);
    });
  },
};

export const DefaultValueTest: Story = {
  name: "Test: defaultValue selects matching tab",
  tags: ["!autodocs"],
  render: () => <SampleTabs defaultValue="tab3" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(isActive(getTab(canvas, "Tab 3"))).toBe(true);
    await expect(isActive(getTab(canvas, "Tab 1"))).toBe(false);
  },
};

export const ControlledSignalTest: Story = {
  name: "Test: external signal drives selection (controlled)",
  tags: ["!autodocs"],
  render: () => <ControlledTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(isActive(getTab(canvas, "Tab 1"))).toBe(true);
    await expect(canvas.getByText(/selected: tab1/)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: /Go to tab2/i }));

    await waitFor(() => {
      expect(canvas.getByText(/selected: tab2/)).toBeInTheDocument();
      expect(isActive(getTab(canvas, "Tab 2"))).toBe(true);
      expect(isActive(getTab(canvas, "Tab 1"))).toBe(false);
    });
  },
};
