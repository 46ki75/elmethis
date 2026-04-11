import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmSnackbarContainer } from "./ElmSnackbarContainer";
import type { SnackbarItem } from "./ElmSnackbarContainer";
import React, { useCallback, useRef, useState } from "react";

let idCounter = 0;

const meta: Meta<typeof ElmSnackbarContainer> = {
  title: "Components/Containments/ElmSnackbarContainer",
  component: ElmSnackbarContainer,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => {
    const PrimaryStory = () => {
      const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);
      const timeoutsRef = useRef<Map<string, number>>(new Map());

      const remove = useCallback((id: string) => {
        setSnackbars((prev) => prev.filter((s) => s.id !== id));
        const timeout = timeoutsRef.current.get(id);
        if (timeout) {
          clearTimeout(timeout);
          timeoutsRef.current.delete(id);
        }
      }, []);

      const push = useCallback(
        (opts: { label?: string; children?: React.ReactNode }) => {
          const id = String(++idCounter);
          const close = () => remove(id);
          const item: SnackbarItem = { id, ...opts, close };

          setSnackbars((prev) => [...prev, item]);

          const timeout = window.setTimeout(() => remove(id), 5000);
          timeoutsRef.current.set(id, timeout);
        },
        [remove],
      );

      return (
        <div>
          <button onClick={() => push({ label: "Hello World" })}>
            Push Snackbar
          </button>
          <ElmSnackbarContainer snackbars={snackbars} />
        </div>
      );
    };
    return <PrimaryStory />;
  },
};
