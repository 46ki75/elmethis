import { afterEach, describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$, useSignal } from "@qwik.dev/core";

import { TextApi } from "@a2ui/web_core/v0_9/basic_catalog";

import { ElmA2ui } from "./elm-a2ui";
import { basicCatalog } from "./catalog/basic-catalog";
import { defineRenderer } from "./catalog/catalog";

const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/basic_catalog.json";

const createMessages = (...components: unknown[]) => [
  {
    version: "v0.9",
    createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
  },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "s", components },
  },
];

const withData = (path: string, value: unknown, ...components: unknown[]) => [
  {
    version: "v0.9",
    createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
  },
  { version: "v0.9", updateDataModel: { surfaceId: "s", path, value } },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "s", components },
  },
];

describe("ElmA2ui", () => {
  test("renders nothing when no url or messages are supplied", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmA2ui />);
    // No SurfaceView is mounted — surface map is empty.
    expect(screen.querySelectorAll("[data-a2ui-component-id]").length).toBe(0);
  });

  test("renders a root Column with Text children from pre-built messages", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          { component: "Column", id: "root", children: ["t1", "t2"] },
          { component: "Text", id: "t1", text: "alpha" },
          { component: "Text", id: "t2", text: "beta" },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("alpha");
    expect(screen.outerHTML).toContain("beta");
  });

  test("resolves a path binding from the data model", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={withData(
          "/user/name",
          "Ada",
          { component: "Column", id: "root", children: ["greeting"] },
          {
            component: "Text",
            id: "greeting",
            text: { path: "/user/name" },
          },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("Ada");
  });

  test("renders a Button component under the host component-id wrapper", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          { component: "Column", id: "root", children: ["btn"] },
          {
            component: "Button",
            id: "btn",
            child: "label",
            action: { action: "submit" },
          },
          { component: "Text", id: "label", text: "Submit" },
        )}
      />,
    );
    const button = screen.querySelector(
      '[data-a2ui-component-id="btn"] [role="button"]',
    );
    expect(button).not.toBeNull();
    expect(screen.outerHTML).toContain("Submit");
  });

  test("renders a bound TextField under the host component-id wrapper", async () => {
    // Post-Phase-2 the input no longer emits `data-a2ui-bind` — write-back
    // is wired through an inline QRL inside the renderer. Tests should
    // locate the input via the host wrapper's stable `data-a2ui-component-id`.
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          { component: "Column", id: "root", children: ["field"] },
          {
            component: "TextField",
            id: "field",
            label: "Name",
            value: { path: "/form/name" },
          },
        )}
      />,
    );
    const input = screen.querySelector(
      '[data-a2ui-component-id="field"] input',
    );
    expect(input).not.toBeNull();
  });

  test("custom catalog overrides a renderer", async () => {
    const customCatalog = basicCatalog.extend(
      defineRenderer(TextApi, ({ props, resolve }) => (
        <mark data-custom-text>{resolve(props.text)}</mark>
      )),
    );
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        catalog={customCatalog}
        messages={createMessages(
          { component: "Column", id: "root", children: ["t"] },
          { component: "Text", id: "t", text: "overridden" },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("data-custom-text");
    expect(screen.outerHTML).toContain("overridden");
  });

  test("ignores messages that arrived before createSurface", async () => {
    // A stray updateComponents with no matching surface is silently dropped.
    // The SDK throws `A2uiStateError` for this, which `ElmA2ui` catches and
    // funnels to `console.warn`. Silence it here so the expected error path
    // doesn't pollute the test stderr, and pin the contract by asserting the
    // warn was called with the offending message and a real Error.
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={[
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "missing",
              components: [
                { component: "Text", id: "root", text: "should not appear" },
              ],
            },
          },
        ]}
      />,
    );
    expect(screen.outerHTML).not.toContain("should not appear");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[ElmA2ui] skipped invalid A2UI message:"),
      expect.objectContaining({ updateComponents: expect.any(Object) }),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  test("renders a [Loading id…] placeholder when a child id is missing", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          // root references "ghost", which is never sent.
          { component: "Column", id: "root", children: ["ghost"] },
        )}
      />,
    );
    const loader = screen.querySelector('[data-a2ui-state="loading"]');
    expect(loader).not.toBeNull();
    expect(screen.outerHTML).toContain("[Loading ghost…]");
  });

  test("renders an Unknown component placeholder for missing renderer types", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={createMessages(
          { component: "Column", id: "root", children: ["x"] },
          // `Mystery` is not in the basic catalog.
          { component: "Mystery", id: "x" },
        )}
      />,
    );
    const unknown = screen.querySelector('[data-a2ui-state="unknown"]');
    expect(unknown).not.toBeNull();
    expect(screen.outerHTML).toContain("Unknown component: Mystery");
  });

  test("renders multiple surfaces side-by-side", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={[
          {
            version: "v0.9",
            createSurface: { surfaceId: "a", catalogId: BASIC_CATALOG_ID },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "a",
              components: [{ component: "Text", id: "root", text: "first" }],
            },
          },
          {
            version: "v0.9",
            createSurface: { surfaceId: "b", catalogId: BASIC_CATALOG_ID },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "b",
              components: [{ component: "Text", id: "root", text: "second" }],
            },
          },
        ]}
      />,
    );
    expect(screen.outerHTML).toContain("first");
    expect(screen.outerHTML).toContain("second");
  });

  test("an updateDataModel after initial render updates resolved text", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmA2ui
        messages={withData(
          "/v",
          "one",
          { component: "Column", id: "root", children: ["t"] },
          { component: "Text", id: "t", text: { path: "/v" } },
        )}
      />,
    );
    expect(screen.outerHTML).toContain("one");
    // We can't easily push more messages into the live store via this surface
    // API in tests — the basic check above confirms the binding works on
    // initial render. Further dynamic-update coverage lives in the
    // render-tree spec which feeds a MessageProcessor directly.
  });

  // BUG repro (review #1 + #8a): SurfaceView attaches its native event
  // delegator inside a default-strategy `useVisibleTask$`. In jsdom (no
  // IntersectionObserver) the task never fires, so the delegator is never
  // wired up. After the fix (e.g. `{ strategy: "document-ready" }`), an input
  // event on a TextField should write back into the data model and the bound
  // Text should reflect the new value.
  //
  // Note: the surface-level delegator listens via native `addEventListener`,
  // not via Qwik's QRL system, so `userEvent` (which dispatches through
  // Qwik's container) will only reach it if the test harness also routes the
  // event natively. If the test fails after fixing the strategy, it likely
  // means the env limitation requires browser-level coverage (e.g. Playwright)
  // instead.
  test("input on a bound TextField writes back to the data model", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmA2ui
        messages={withData(
          "/form/name",
          "initial",
          { component: "Column", id: "root", children: ["field", "echo"] },
          {
            component: "TextField",
            id: "field",
            label: "Name",
            value: { path: "/form/name" },
          },
          { component: "Text", id: "echo", text: { path: "/form/name" } },
        )}
      />,
    );

    const input = screen.querySelector(
      '[data-a2ui-component-id="field"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();

    input!.value = "Ada";
    await userEvent('[data-a2ui-component-id="field"] input', "input");

    // After write-back the bound Text should reflect the new value.
    expect(screen.outerHTML).toContain("Ada");
    expect(screen.outerHTML).not.toContain("initial");
  });

  // BUG repro (review #2): `messages` is shallow-cloned into a `useStore` at
  // mount and never re-tracked. When a parent re-renders with a different
  // messages array, the inner store still sees the original list and the new
  // components / data updates never reach the MessageProcessor.
  test("appending to the messages prop after mount renders the new components", async () => {
    const initial = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [{ component: "Text", id: "root", text: "first" }],
        },
      },
    ];
    const appended = [
      ...initial,
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [{ component: "Text", id: "root", text: "second" }],
        },
      },
    ];

    const Wrapper = component$(() => {
      const showMore = useSignal(false);
      return (
        <div>
          <button id="grow" onClick$={() => (showMore.value = true)}>
            grow
          </button>
          <ElmA2ui messages={showMore.value ? appended : initial} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("first");

    await userEvent("#grow", "click");

    expect(screen.outerHTML).toContain("second");
    expect(screen.outerHTML).not.toContain("first");
  });
});

// ---------------------------------------------------------------------------
// Review-round-2 repro tests
//
// These reproduce the four concerns surfaced by the second-pass code review:
//   #1 TextField double write-back (inline handler + surface delegator both fire)
//   #3 `messages` prop stream-swap is ignored when the new array is shorter
//   #4 Per-component host subscriptions are never released on unmount
//   #6 `catalogId` captured at first render — adding a new catalog id mid-flight
//      doesn't register the new catalog
//
// Each test should FAIL on `qwik/refactor/a2ui` HEAD.
// ---------------------------------------------------------------------------

describe("ElmA2ui — review round 2 (failing repros)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // #1 — Each input event on a bound TextField should call `DataContext.set`
  // exactly once. The Phase 2 refactor removed the surface-level event
  // delegator's path for TextField: the renderer no longer emits
  // `data-a2ui-bind`, so the inline `onInput$` is now the only write-back
  // path and the spy registers exactly one call per event.
  //
  // Historical note: pre-Phase-2 the renderer emitted both an inline
  // handler AND `data-a2ui-bind`, which made the surface delegator and the
  // inline handler both fire — but the bug only manifested in real
  // browsers because createDOM's `userEvent` doesn't populate
  // `event.target`, so the delegator's `target?.closest(…)` always bailed.
  test("TextField input triggers DataContext.set exactly once per event", async () => {
    const a2ui = await import("@a2ui/web_core/v0_9");
    const setSpy = vi.spyOn(a2ui.DataContext.prototype, "set");

    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmA2ui
        messages={[
          {
            version: "v0.9",
            createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
          },
          {
            version: "v0.9",
            updateDataModel: { surfaceId: "s", path: "/v", value: "" },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "s",
              components: [
                { component: "Column", id: "root", children: ["f"] },
                {
                  component: "TextField",
                  id: "f",
                  label: "x",
                  value: { path: "/v" },
                },
              ],
            },
          },
        ]}
      />,
    );

    const input = screen.querySelector(
      '[data-a2ui-component-id="f"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();

    setSpy.mockClear();
    input!.value = "x";
    await userEvent('[data-a2ui-component-id="f"] input', "input");

    expect(setSpy).toHaveBeenCalledTimes(1);
  });

  // #3 — If a parent swaps `messages` for a fresh stream (e.g. a new
  // conversation), ElmA2ui should reflect the new stream. Today the sync task
  // only appends when the new array is longer; an equal-or-shorter swap is
  // either silently ignored or warned about while leaving the old surfaces
  // intact. We swap to an array of the same length but with a different
  // surface id and assert that the new surface renders.
  test("swapping messages to a fresh stream of equal length renders the new stream", async () => {
    const streamA = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "a", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a",
          components: [{ component: "Text", id: "root", text: "from-A" }],
        },
      },
    ];
    const streamB = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "b", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "b",
          components: [{ component: "Text", id: "root", text: "from-B" }],
        },
      },
    ];

    const Wrapper = component$(() => {
      const useB = useSignal(false);
      return (
        <div>
          <button id="swap" onClick$={() => (useB.value = true)}>
            swap
          </button>
          <ElmA2ui messages={useB.value ? streamB : streamA} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("from-A");

    await userEvent("#swap", "click");

    expect(screen.outerHTML).toContain("from-B");
    expect(screen.outerHTML).not.toContain("from-A");
  });

  // #4 — Each `ComponentHost` subscribes to four `EventEmitter`s at
  // mount: `componentsModel.onCreated`, `onDeleted`, the `dataModel`
  // root, and the resolved `model.onUpdated`. When the host disappears
  // from the rendered tree — because its parent dropped it from
  // `children` — Qwik unmounts the `component$` and the host's
  // `useTask$` cleanup must release every sub. The pre-refactor
  // surface-level subscription model couldn't honor this contract
  // because subscriptions weren't owned per-id.
  //
  // Counting `unsubscribe` calls alone is not sufficient: when the SDK
  // calls `ComponentModel.dispose()` it clears its listener Set
  // directly, so any subsequent `unsubscribe` on the disposed model
  // would still register on the counter even though it's a no-op on
  // the Set. Instead we track ACTIVE subscriptions (subscribes minus
  // unsubscribes) and assert the count drops after the child is
  // dropped — verifying the cleanup contract, not the bookkeeping.
  test("dropping a child from its parent's children list releases the host's subscriptions on unmount", async () => {
    const a2ui = await import("@a2ui/web_core/v0_9");
    const proto = a2ui.EventEmitter.prototype as unknown as {
      subscribe: (l: unknown) => { unsubscribe(): void };
    };
    const realSubscribe = proto.subscribe;
    let active = 0;
    proto.subscribe = function (listener: unknown) {
      active++;
      const sub = realSubscribe.call(this, listener) as {
        unsubscribe(): void;
      };
      const realUnsub = sub.unsubscribe.bind(sub);
      return {
        unsubscribe() {
          active--;
          realUnsub();
        },
      };
    };

    try {
      const both = [
        {
          version: "v0.9",
          createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "s",
            components: [
              { component: "Column", id: "root", children: ["a", "b"] },
              { component: "Text", id: "a", text: "alpha" },
              { component: "Text", id: "b", text: "beta" },
            ],
          },
        },
      ];
      // Re-emit `root` with `b` dropped from `children`. The model for
      // `b` stays in `componentsModel`, but no `<ComponentHost id="b" />`
      // is rendered, so Qwik unmounts the host and fires its cleanup.
      const onlyA = [
        ...both,
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "s",
            components: [{ component: "Column", id: "root", children: ["a"] }],
          },
        },
      ];

      const Wrapper = component$(() => {
        const drop = useSignal(false);
        return (
          <div>
            <button id="drop" onClick$={() => (drop.value = true)}>
              drop
            </button>
            <ElmA2ui messages={drop.value ? onlyA : both} />
          </div>
        );
      });

      const { screen, render, userEvent } = await createDOM();
      await render(<Wrapper />);
      expect(screen.outerHTML).toContain("alpha");
      expect(screen.outerHTML).toContain("beta");

      const beforeDrop = active;
      await userEvent("#drop", "click");

      expect(screen.outerHTML).toContain("alpha");
      expect(screen.outerHTML).not.toContain("beta");
      // The dropped host owned three `EventEmitter`-backed subs at
      // mount time (`onCreated`, `onDeleted`, `model.onUpdated`). The
      // fourth — `dataModel.subscribe("/")` — uses a separate path-
      // indexed mechanism and doesn't hit this prototype patch, so we
      // assert on the `EventEmitter`-tracked floor. `>= 3` (not
      // `=== 3`) leaves room for adding subs to the host in the future.
      expect(beforeDrop - active).toBeGreaterThanOrEqual(3);
    } finally {
      proto.subscribe = realSubscribe;
    }
  });

  // #6 — `catalogId` is captured at first render: the setup `useTask$`
  // pre-registers `Catalog`s for whatever ids it sees on mount, and never
  // re-runs. If the parent changes `catalogId` to a new value AND streams a
  // message referencing the new catalog, the processor doesn't know about
  // it. The new surface fails silently inside the try/catch wrapper.
  //
  // We use `catalogId` (not `catalog`) as the test vector because the
  // CatalogRenderer prop can't cross a QRL boundary in a child component$
  // (Q3 serialization error), so we'd need noSerialize gymnastics; the
  // underlying first-render-capture bug is the same.
  test("changing `catalogId` after mount registers the new catalog", async () => {
    const CATALOG_A = "https://example.test/catalog-A";
    const CATALOG_B = "https://example.test/catalog-B";

    const streamA = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "a", catalogId: CATALOG_A },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a",
          components: [{ component: "Text", id: "root", text: "from-A" }],
        },
      },
    ];
    const streamWithB = [
      ...streamA,
      {
        version: "v0.9",
        createSurface: { surfaceId: "b", catalogId: CATALOG_B },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "b",
          components: [{ component: "Text", id: "root", text: "from-B" }],
        },
      },
    ];

    const Wrapper = component$(() => {
      const showB = useSignal(false);
      return (
        <div>
          <button id="add-b" onClick$={() => (showB.value = true)}>
            add b
          </button>
          <ElmA2ui
            catalogId={showB.value ? CATALOG_B : CATALOG_A}
            messages={showB.value ? streamWithB : streamA}
          />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("from-A");

    await userEvent("#add-b", "click");

    // Surface B should appear alongside A. Today the setup task only knows
    // about CATALOG_A, so the createSurface for CATALOG_B throws inside the
    // per-message try/catch and the surface is never registered.
    expect(screen.outerHTML).toContain("from-A");
    expect(screen.outerHTML).toContain("from-B");
  });
});

// ---------------------------------------------------------------------------
// Review-round-3 repro tests
//
// Follow-up concerns surfaced by the third-pass code review:
//   M1  Stream swap leaks the previous processor's SurfaceGroupModel —
//       the old surfaces / dataModels / componentsModels are never disposed.
//   M3  `dispatchAction$` walks only the top-level event.context, so nested
//       `{ path }` literals reach the action listener unresolved.
// ---------------------------------------------------------------------------

describe("ElmA2ui — review round 3 (failing repros)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // M1 — When the unified setup task takes the rebuild path (a fresh
  // stream prefix or a `catalogId` change), the previous processor's
  // `SurfaceGroupModel` must be disposed. `SurfaceGroupModel.dispose()`
  // cascades into per-surface dispose (dataModel + componentsModel +
  // per-surface emitters). Without it the old surface graph stays
  // pinned across every stream swap.
  test("stream swap disposes the previous SurfaceGroupModel", async () => {
    const a2ui = await import("@a2ui/web_core/v0_9");
    const disposeSpy = vi.spyOn(a2ui.SurfaceGroupModel.prototype, "dispose");

    const streamA = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "a", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a",
          components: [{ component: "Text", id: "root", text: "from-A" }],
        },
      },
    ];
    // Different surface id and array reference → rebuild path.
    const streamB = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "b", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "b",
          components: [{ component: "Text", id: "root", text: "from-B" }],
        },
      },
    ];

    const Wrapper = component$(() => {
      const useB = useSignal(false);
      return (
        <div>
          <button id="swap" onClick$={() => (useB.value = true)}>
            swap
          </button>
          <ElmA2ui messages={useB.value ? streamB : streamA} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("from-A");

    disposeSpy.mockClear();
    await userEvent("#swap", "click");

    expect(screen.outerHTML).toContain("from-B");
    // Exactly one dispose call for the previous SurfaceGroupModel —
    // the new processor's group isn't disposed (it's still in use).
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  // M3 — Actions whose `event.context` contains nested `{ path }`
  // literals must be deep-resolved before dispatch, matching the
  // official `GenericBinder.ACTION` behavior. The SDK's
  // `DataContext.resolveAction` only walks the top-level context
  // record, so without our recursive resolver the listener would
  // receive `{ path: "/user/name" }` instead of the resolved value.
  test("dispatchAction deep-resolves nested {path} bindings inside event.context", async () => {
    const a2ui = await import("@a2ui/web_core/v0_9");
    const dispatchSpy = vi.spyOn(a2ui.SurfaceModel.prototype, "dispatchAction");

    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmA2ui
        messages={[
          {
            version: "v0.9",
            createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
          },
          {
            version: "v0.9",
            updateDataModel: {
              surfaceId: "s",
              path: "/user/name",
              value: "Ada",
            },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "s",
              components: [
                { component: "Column", id: "root", children: ["btn"] },
                {
                  component: "Button",
                  id: "btn",
                  child: "label",
                  action: {
                    event: {
                      name: "submit",
                      // The nested `payload.user` is what the SDK's
                      // top-level `resolveAction` walks past — only
                      // our deep resolver evaluates it.
                      context: {
                        payload: { user: { path: "/user/name" } },
                      },
                    },
                  },
                },
                { component: "Text", id: "label", text: "Go" },
              ],
            },
          },
        ]}
      />,
    );

    dispatchSpy.mockClear();
    await userEvent('[data-a2ui-component-id="btn"] [role="button"]', "click");

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const dispatched = dispatchSpy.mock.calls[0]?.[0];
    expect(dispatched).toEqual({
      event: {
        name: "submit",
        context: {
          payload: { user: "Ada" },
        },
      },
    });
    expect(screen.outerHTML).toContain("Go");
  });

  // H1 — When a single-child parent (e.g. Card) is re-bound to point at
  // a different child id ("a" → "b"), the recursion site
  // (`<ComponentHost id={childId} ... />`) has no `key`, so Qwik may
  // reconcile the slot by position and reuse the same component$
  // instance with `props.id` swapped. The host-local `everHadModel`
  // latch (set true while bound to "a") would then suppress the
  // `[Loading b…]` placeholder for a genuinely out-of-order "b" —
  // exactly the flicker the latch was meant to fix, just shifted to a
  // different scenario. Card is the vehicle here because Column/Row/
  // List already wrap each child in a `key={id:i}` span which forces
  // an unmount/remount on id change. Fix is either keying the
  // recursion by child id or resetting the latch on `props.id` change.
  test("swapping a Card's child id from a→b shows the [Loading b…] placeholder", async () => {
    const phaseOne = createMessages(
      { component: "Card", id: "root", child: "a" },
      { component: "Text", id: "a", text: "alpha" },
    );
    // New array reference; same prefix → unified task takes the
    // extension path and processes only the tail message.
    const phaseTwo = [
      ...phaseOne,
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            // Re-bind root's `child` to "b". "b" is intentionally NOT
            // emitted — this is the out-of-order arrival scenario.
            { component: "Card", id: "root", child: "b" },
          ],
        },
      },
    ];

    const Wrapper = component$(() => {
      const showB = useSignal(false);
      return (
        <div>
          <button id="swap" onClick$={() => (showB.value = true)}>
            swap
          </button>
          <ElmA2ui messages={showB.value ? phaseTwo : phaseOne} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("alpha");
    expect(screen.outerHTML).not.toContain("[Loading");

    await userEvent("#swap", "click");

    // After the swap, root's only child id is "b" and "b" has no
    // component model. The host MUST render the loading placeholder
    // — anything else (empty card, stale "alpha") is the H1 bug.
    expect(screen.outerHTML).toContain("[Loading b…]");
    expect(screen.outerHTML).not.toContain("alpha");
  });
});

// ---------------------------------------------------------------------------
// Streams & dynamic updates
//
// A2UI is a streaming protocol: an agent emits createSurface / updateComponents
// / updateDataModel messages incrementally. These tests drive the prop in
// successive ticks (Wrapper + useSignal swap) and assert that:
//
//   - new components stream in via appended updateComponents
//   - bound text re-renders when subsequent updateDataModel messages arrive
//   - List templates expand when their bound array grows
//   - new surfaces created mid-stream render alongside existing ones
//   - deleteSurface drops a surface from the DOM
// ---------------------------------------------------------------------------

describe("ElmA2ui — streams & dynamic updates", () => {
  test("appended updateComponents renders newly-added children", async () => {
    const initial = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            { component: "Column", id: "root", children: ["a"] },
            { component: "Text", id: "a", text: "alpha" },
          ],
        },
      },
    ];
    const grown = [
      ...initial,
      // Re-emit root with an extended children list AND introduce a new child.
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            { component: "Column", id: "root", children: ["a", "b"] },
            { component: "Text", id: "b", text: "beta" },
          ],
        },
      },
    ];

    const Wrapper = component$(() => {
      const more = useSignal(false);
      return (
        <div>
          <button id="go" onClick$={() => (more.value = true)}>
            go
          </button>
          <ElmA2ui messages={more.value ? grown : initial} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("alpha");
    expect(screen.outerHTML).not.toContain("beta");

    await userEvent("#go", "click");

    // Both the original and the newly-streamed child must be present —
    // confirms streaming-update merge semantics, not a full surface swap.
    expect(screen.outerHTML).toContain("alpha");
    expect(screen.outerHTML).toContain("beta");
  });

  test("subsequent updateDataModel messages update bound Text live", async () => {
    const initial = withData(
      "/v",
      "one",
      { component: "Column", id: "root", children: ["t"] },
      { component: "Text", id: "t", text: { path: "/v" } },
    );
    const updated = [
      ...initial,
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "s", path: "/v", value: "two" },
      },
    ];

    const Wrapper = component$(() => {
      const push = useSignal(false);
      return (
        <div>
          <button id="push" onClick$={() => (push.value = true)}>
            push
          </button>
          <ElmA2ui messages={push.value ? updated : initial} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("one");

    await userEvent("#push", "click");

    expect(screen.outerHTML).toContain("two");
    expect(screen.outerHTML).not.toContain(">one<");
  });

  test("List re-renders when its bound array grows via updateDataModel", async () => {
    const setupList = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "s",
          path: "/items",
          value: [{ label: "first" }],
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            {
              component: "List",
              id: "root",
              children: { componentId: "item", path: "/items" },
            },
            { component: "Text", id: "item", text: { path: "label" } },
          ],
        },
      },
    ];
    const grown = [
      ...setupList,
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "s",
          path: "/items",
          value: [{ label: "first" }, { label: "second" }],
        },
      },
    ];

    const Wrapper = component$(() => {
      const more = useSignal(false);
      return (
        <div>
          <button id="grow" onClick$={() => (more.value = true)}>
            grow
          </button>
          <ElmA2ui messages={more.value ? grown : setupList} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("first");
    expect(screen.outerHTML).not.toContain("second");

    await userEvent("#grow", "click");

    expect(screen.outerHTML).toContain("first");
    expect(screen.outerHTML).toContain("second");
  });

  test("new createSurface mid-stream renders alongside existing surfaces", async () => {
    const first = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "a", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a",
          components: [{ component: "Text", id: "root", text: "surface-A" }],
        },
      },
    ];
    const both = [
      ...first,
      {
        version: "v0.9",
        createSurface: { surfaceId: "b", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "b",
          components: [{ component: "Text", id: "root", text: "surface-B" }],
        },
      },
    ];

    const Wrapper = component$(() => {
      const second = useSignal(false);
      return (
        <div>
          <button id="add" onClick$={() => (second.value = true)}>
            add
          </button>
          <ElmA2ui messages={second.value ? both : first} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("surface-A");
    expect(screen.outerHTML).not.toContain("surface-B");

    await userEvent("#add", "click");

    expect(screen.outerHTML).toContain("surface-A");
    expect(screen.outerHTML).toContain("surface-B");
  });

  test("deleteSurface removes a surface from the rendered tree", async () => {
    const setup = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "a", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a",
          components: [{ component: "Text", id: "root", text: "doomed" }],
        },
      },
    ];
    const afterDelete = [
      ...setup,
      { version: "v0.9", deleteSurface: { surfaceId: "a" } },
    ];

    const Wrapper = component$(() => {
      const gone = useSignal(false);
      return (
        <div>
          <button id="kill" onClick$={() => (gone.value = true)}>
            kill
          </button>
          <ElmA2ui messages={gone.value ? afterDelete : setup} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("doomed");

    await userEvent("#kill", "click");

    expect(screen.outerHTML).not.toContain("doomed");
  });

  test("structural and data updates compose: append child, then bind it, then push value", async () => {
    // End-to-end mini-stream: agent first introduces a Text, then binds it
    // to /v, then pushes a value. Each step is a separate prop tick.
    const tick1 = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            { component: "Column", id: "root", children: ["greet"] },
            { component: "Text", id: "greet", text: "Hello" },
          ],
        },
      },
    ];
    const tick2 = [
      ...tick1,
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "s", path: "/v", value: "world" },
      },
      // Re-emit `greet` with a bound text — agent decided to make it dynamic.
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            { component: "Text", id: "greet", text: { path: "/v" } },
          ],
        },
      },
    ];
    const tick3 = [
      ...tick2,
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "s", path: "/v", value: "everyone" },
      },
    ];

    const Wrapper = component$(() => {
      const step = useSignal(0);
      const messages =
        step.value === 0 ? tick1 : step.value === 1 ? tick2 : tick3;
      return (
        <div>
          <button id="next" onClick$={() => step.value++}>
            next
          </button>
          <ElmA2ui messages={messages} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Wrapper />);
    expect(screen.outerHTML).toContain("Hello");

    await userEvent("#next", "click");
    expect(screen.outerHTML).toContain("world");
    expect(screen.outerHTML).not.toContain("Hello");

    await userEvent("#next", "click");
    expect(screen.outerHTML).toContain("everyone");
    expect(screen.outerHTML).not.toContain("world");
  });
});
