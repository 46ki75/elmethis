import { useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const useInView = (props?: { defaultValue?: boolean }) => {
  const ref = useSignal<Element>();
  const isVisible = useSignal(props?.defaultValue ?? false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!ref.value) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.isIntersecting;
      },
      { rootMargin: "100px", threshold: 0.1 },
    );

    observer.observe(ref.value);
    return () => observer.disconnect();
  });

  return { ref, isVisible };
};
