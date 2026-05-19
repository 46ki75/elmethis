import { useSignal, useVisibleTask$ } from "@qwik.dev/core";

export const useInView = (props?: { defaultValue?: boolean }) => {
  const ref = useSignal<Element>();
  const isVisible = useSignal(props?.defaultValue ?? false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    () => {
      if (!ref.value) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          isVisible.value = entry.isIntersecting;
        },
        { rootMargin: "100px", threshold: 0.1 },
      );

      observer.observe(ref.value);
      return () => observer.disconnect();
    },
    // The default `intersection-observer` strategy never fires when the host
    // is mounted inside a subtree that starts hidden (e.g. <ElmCollapse>), so
    // a `useInView` consumer in that subtree would be permanently stuck at
    // `isVisible: false`. `document-ready` fires once the DOM is parsed, then
    // our own IntersectionObserver does the actual visibility tracking.
    { strategy: "document-ready" },
  );

  return { ref, isVisible };
};
