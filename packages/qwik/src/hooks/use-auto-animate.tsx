import {
  noSerialize,
  NoSerialize,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import autoAnimate from "@formkit/auto-animate";

export type UseAutoAnimateOptions = {
  config?: Parameters<typeof autoAnimate>[1];
};

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
