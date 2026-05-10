import {
  noSerialize,
  NoSerialize,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import autoAnimate from "@formkit/auto-animate";

export type UseAutoAnimateOptions = {
  /**
   * The configuration options for auto-animate.
   */
  config?: Parameters<typeof autoAnimate>[1];
};

/**
 * A hook that provides an easy way to add auto-animate to a component.
 * 
 * @see {@link https://auto-animate.formkit.com/|Auto Animate} for more information.
 * 
 * @example 
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
 */
export const useAutoAnimate = (options?: UseAutoAnimateOptions) => {
  const ref = useSignal<HTMLElement>();
  const animationController =
    useSignal<NoSerialize<ReturnType<typeof autoAnimate>>>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (ref.value != null) {
      animationController.value = noSerialize(
        autoAnimate(ref.value, options?.config),
      );
    }
    cleanup(() => {
      if (
        animationController.value != null &&
        animationController.value.isEnabled()
      ) {
        animationController.value.disable();
      }
    });
  });

  return { ref, animationController };
};
