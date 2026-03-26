import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTabs } from "./elm-tabs";
import { $ } from "@builder.io/qwik";

const meta: Meta<typeof ElmTabs> = {
  title: "Components/Containments/elm-tabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render() {
    return (
      <ElmTabs
        renderTabFunctions$={[
          $(() => <div>Tab 1</div>),
          $(() => <div>Tab 2</div>),
          $(() => <div>Tab 3</div>),
        ]}
        renderTabContentFunctions$={[
          $(() => <div>Content 1</div>),
          $(() => <div>Content 2</div>),
          $(() => <div>Content 3</div>),
        ]}
      />
    );
  },
};
