import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { useAutoAnimate, type UseAutoAnimateOptions } from "./use-auto-animate";

const meta = {
  title: "Hooks/useAutoAnimate",
  tags: ["autodocs"],
  args: {},
} satisfies Meta<UseAutoAnimateOptions>;

export default meta;
type Story = StoryObj<UseAutoAnimateOptions>;

const ListRender = (options: UseAutoAnimateOptions) => {
  const { ref } = useAutoAnimate<HTMLUListElement>(options);
  const [items, setItems] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const handleShuffle = () => {
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <div>
      <button onClick={handleShuffle}>Click me</button>
      <ul ref={ref}>
        {items.map((item) => (
          <li key={item}>Item {item}</li>
        ))}
      </ul>
    </div>
  );
};

export const List: Story = {
  render: (options) => <ListRender {...options} />,
};

const GridRender = (options: UseAutoAnimateOptions) => {
  const { ref } = useAutoAnimate<HTMLDivElement>(options);
  const [items, setItems] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ]);

  const handleShuffle = () => {
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleRotate = () => {
    setItems((prev) => [...prev.slice(1), prev[0]]);
  };

  return (
    <div>
      <button onClick={handleShuffle}>Shuffle</button>
      <button onClick={handleRotate}>Rotate</button>
      <div
        ref={ref}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: ".25rem",
          marginTop: "1rem",
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            style={{
              backgroundColor: "white",
              padding: "4rem 0",
              textAlign: "center",
              border: "1px solid oklch(from gray l c h / 25%)",
              borderRadius: "0.25rem",
            }}
          >
            Item {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Grid: Story = {
  render: (options) => <GridRender {...options} />,
};
