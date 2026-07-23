import type {
  AnimationController,
  AutoAnimateOptions,
  AutoAnimationPlugin,
} from "@formkit/auto-animate";
import {
  createSignal,
  getOwner,
  onCleanup,
  onMount,
  untrack,
  type Accessor,
  type Setter,
} from "solid-js";

export interface CreateAutoAnimateOptions {
  /**
   * Configuration or plugin passed to Auto Animate.
   *
   * When the parent is a grid or wrapping flex container, use a non-stretching
   * `align-content` value if children should keep their height while the parent
   * animates between sizes.
   */
  config?: Partial<AutoAnimateOptions> | AutoAnimationPlugin;

  /** Whether animations are initially enabled. Defaults to `true`. */
  enabled?: boolean;
}

export interface CreateAutoAnimateResult<T extends HTMLElement> {
  /** Attach this callback to the parent whose direct children should animate. */
  ref: (element: T | null) => void;

  /** The desired enabled state managed by this primitive. */
  enabled: Accessor<boolean>;

  /** Enables or disables the current controller and future controllers. */
  setEnabled: Setter<boolean>;

  /** The controller for the currently attached element, once mounted. */
  controller: Accessor<AnimationController | undefined>;
}

/**
 * Attaches framework-neutral Auto Animate to a Solid-owned element.
 *
 * The controller is created only after the owner mounts. Reusing `ref` with a
 * new element replaces and destroys the previous controller.
 */
export function createAutoAnimate<T extends HTMLElement = HTMLElement>(
  options?: CreateAutoAnimateOptions,
): CreateAutoAnimateResult<T> {
  const [enabled, setEnabledSignal] = createSignal(options?.enabled ?? true);
  const [controller, setController] = createSignal<AnimationController>();

  let mounted = false;
  let element: T | undefined;
  let currentController: AnimationController | undefined;
  let initialization = 0;

  const destroyController = () => {
    const previousController = currentController;
    currentController = undefined;
    setController(undefined);
    previousController?.destroy?.();
  };

  const initialize = async (nextElement: T | undefined) => {
    const generation = ++initialization;
    destroyController();
    if (nextElement === undefined) return;

    let autoAnimate: (typeof import("@formkit/auto-animate"))["default"];
    try {
      ({ default: autoAnimate } = await import("@formkit/auto-animate"));
    } catch {
      return;
    }
    if (!mounted || generation !== initialization || element !== nextElement) {
      return;
    }

    const nextController = autoAnimate(nextElement, options?.config);
    if (!enabled()) nextController.disable();

    currentController = nextController;
    setController(nextController);
  };

  const ref = (nextElement: T | null) => {
    const normalizedElement = nextElement ?? undefined;
    if (normalizedElement === element) return;

    element = normalizedElement;
    if (normalizedElement !== undefined && getOwner()) {
      onCleanup(() => {
        if (element === normalizedElement) ref(null);
      });
    }
    if (mounted) void initialize(element);
  };

  const setEnabled = ((nextValue: unknown) =>
    untrack(() => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (previous: boolean) => boolean)(enabled())
          : (nextValue as boolean);

      setEnabledSignal(resolvedValue);
      if (resolvedValue) currentController?.enable();
      else currentController?.disable();

      return resolvedValue;
    })) as Setter<boolean>;

  onMount(() => {
    mounted = true;
    void initialize(element);
  });

  onCleanup(() => {
    mounted = false;
    element = undefined;
    initialization++;
    destroyController();
  });

  return { ref, enabled, setEnabled, controller };
}
