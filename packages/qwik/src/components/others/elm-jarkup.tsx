import { component$ } from "@builder.io/qwik";

import styles from "./elm-jarkup.module.scss";

export interface ElmJarkupProps {
  placeholder?: string;
}

export const ElmJarkup = component$<ElmJarkupProps>(
  ({ placeholder = "Howdy" }) => {
    return <>{placeholder}</>;
  },
);
