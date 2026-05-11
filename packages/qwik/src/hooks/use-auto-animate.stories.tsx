import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useAutoAnimate, type UseAutoAnimateOptions } from "./use-auto-animate";
import { $, component$, useStore, useStylesScoped$ } from "@builder.io/qwik";
import { ElmList } from "../components/typography/elm-list";
import { ElmInlineText } from "../components/typography/elm-inline-text";

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

export const Grid: Story = {
  render: (options) => {
    const Render = component$(() => {
      const { ref } = useAutoAnimate(options);

      const store = useStore<{ items: number[] }>({
        items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      });

      const handleSuffle = $(() => {
        store.items = store.items.sort(() => Math.random() - 0.5);
      });

      const handleRotate = $(() => {
        store.items = [...store.items.slice(1), store.items[0]];
      });

      useStylesScoped$(`
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: .25rem;
            margin-top: 1rem;
          }
          .item {
            background-color: white;
            padding: 4rem 0;
            text-align: center;
            border: 1px solid oklch(from gray l c h / 25%);
            border-radius: 0.25rem;
          }
        `);

      return (
        <div>
          <button onClick$={handleSuffle}>Shuffle</button>
          <button onClick$={handleRotate}>Rotate</button>
          <div ref={ref} class="grid">
            {store.items.map((item) => (
              <div key={item} class="item">
                <ElmInlineText>Item {item}</ElmInlineText>
              </div>
            ))}
          </div>
        </div>
      );
    });

    return <Render />;
  },
};
