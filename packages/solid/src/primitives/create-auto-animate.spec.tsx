import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { createSignal, Show } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAutoAnimate } from "./create-auto-animate";

const mocks = vi.hoisted(() => ({
  autoAnimate: vi.fn(),
}));

vi.mock("@formkit/auto-animate", () => ({
  default: mocks.autoAnimate,
}));

const createController = (parent: HTMLElement) => {
  let enabled = true;

  return {
    parent,
    enable: vi.fn(() => {
      enabled = true;
    }),
    disable: vi.fn(() => {
      enabled = false;
    }),
    isEnabled: vi.fn(() => enabled),
    destroy: vi.fn(() => {
      enabled = false;
    }),
  };
};

describe("[CSR] createAutoAnimate", () => {
  beforeEach(() => {
    mocks.autoAnimate.mockReset();
  });

  it("attaches on mount and controls the enabled state", async () => {
    const config = { duration: 180 };
    const controller = createController(document.createElement("div"));
    mocks.autoAnimate.mockReturnValue(controller);

    let api!: ReturnType<typeof createAutoAnimate<HTMLUListElement>>;
    const rendered = render(() => {
      api = createAutoAnimate<HTMLUListElement>({ config });
      return <ul ref={api.ref} data-testid="list" />;
    });

    const list = rendered.getByTestId("list");
    await waitFor(() => expect(mocks.autoAnimate).toHaveBeenCalledOnce());
    expect(mocks.autoAnimate).toHaveBeenCalledWith(list, config);
    expect(api.controller()).toBe(controller);
    expect(api.enabled()).toBe(true);

    expect(api.setEnabled(false)).toBe(false);
    expect(api.enabled()).toBe(false);
    expect(controller.disable).toHaveBeenCalledOnce();

    expect(api.setEnabled((current) => !current)).toBe(true);
    expect(api.enabled()).toBe(true);
    expect(controller.enable).toHaveBeenCalledOnce();

    rendered.unmount();
    expect(controller.destroy).toHaveBeenCalledOnce();
    expect(api.controller()).toBeUndefined();
  });

  it("destroys controllers when the attached element is replaced or cleared", async () => {
    const firstController = createController(document.createElement("div"));
    const secondController = createController(document.createElement("div"));
    mocks.autoAnimate
      .mockReturnValueOnce(firstController)
      .mockReturnValueOnce(secondController);

    let api!: ReturnType<typeof createAutoAnimate<HTMLElement>>;
    const rendered = render(() => {
      api = createAutoAnimate();
      const [alternate, setAlternate] = createSignal(false);

      return (
        <>
          <button onClick={() => setAlternate(true)}>Replace</button>
          <Show
            when={alternate()}
            fallback={<ul ref={api.ref} data-testid="parent" />}
          >
            <section ref={api.ref} data-testid="parent" />
          </Show>
        </>
      );
    });

    const firstParent = rendered.getByTestId("parent");
    await waitFor(() =>
      expect(mocks.autoAnimate).toHaveBeenNthCalledWith(
        1,
        firstParent,
        undefined,
      ),
    );
    api.setEnabled(false);
    expect(firstController.disable).toHaveBeenCalledOnce();

    await fireEvent.click(rendered.getByRole("button", { name: "Replace" }));

    const secondParent = rendered.getByTestId("parent");
    expect(secondParent).not.toBe(firstParent);
    await waitFor(() =>
      expect(mocks.autoAnimate).toHaveBeenNthCalledWith(
        2,
        secondParent,
        undefined,
      ),
    );
    expect(firstController.destroy).toHaveBeenCalledOnce();
    expect(api.controller()).toBe(secondController);
    expect(secondController.disable).toHaveBeenCalledOnce();
    expect(secondController.isEnabled()).toBe(false);

    api.ref(null);
    expect(secondController.destroy).toHaveBeenCalledOnce();
    expect(api.controller()).toBeUndefined();

    rendered.unmount();
    expect(secondController.destroy).toHaveBeenCalledOnce();
  });

  it("destroys the controller when its element is conditionally removed", async () => {
    const controller = createController(document.createElement("div"));
    mocks.autoAnimate.mockReturnValue(controller);

    let api!: ReturnType<typeof createAutoAnimate<HTMLUListElement>>;
    const rendered = render(() => {
      api = createAutoAnimate<HTMLUListElement>();
      const [visible, setVisible] = createSignal(true);

      return (
        <>
          <button onClick={() => setVisible(false)}>Hide</button>
          <Show when={visible()}>
            <ul ref={api.ref} data-testid="parent" />
          </Show>
        </>
      );
    });

    await waitFor(() => expect(mocks.autoAnimate).toHaveBeenCalledOnce());
    expect(api.controller()).toBe(controller);

    await fireEvent.click(rendered.getByRole("button", { name: "Hide" }));

    expect(rendered.queryByTestId("parent")).not.toBeInTheDocument();
    expect(controller.destroy).toHaveBeenCalledOnce();
    expect(api.controller()).toBeUndefined();
  });
});
