import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-rectangle-wave.scoped.scss?inline";

export interface ElmRectangleWaveProps {
  placeholder?: string;
}

export const ElmRectangleWave = component$<ElmRectangleWaveProps>(() => {
  useStylesScoped$(styles);
  return <div aria-hidden="true" class="rectangle-wave"></div>;
});
