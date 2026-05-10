import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useAutoAnimate, type UseAutoAnimateOptions } from "./use-auto-animate";
import { $, component$, useStore } from "@builder.io/qwik";
import { ElmList } from "../components/typography/elm-list";

const meta: Meta<UseAutoAnimateOptions> = {
  title: "Hooks/useAutoAnimate",
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<UseAutoAnimateOptions>;

export const List: Story = {
  render: (options) => {
    const Render = component$(() => {
      const { ref } = useAutoAnimate(options);

      const store = useStore<{ items: number[] }>({
        items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      });

      const handleSuffle = $(() => {
        store.items = store.items.sort(() => Math.random() - 0.5);
      });

      return (
        <div>
          <button onClick$={handleSuffle}>Click me</button>
          <ElmList listStyle="unordered" ref={ref}>
            {store.items.map((item) => (
              <li key={item}>Item {item}</li>
            ))}
          </ElmList>
        </div>
      );
    });

    return <Render />;
  },
};
