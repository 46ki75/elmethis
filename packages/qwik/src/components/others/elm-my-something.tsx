import { component$ } from "@builder.io/qwik";

import styles from "./elm-my-something.module.scss";

export interface ElmMySomethingProps {
  placeholder?: string;
}

export const ElmMySomething = component$<ElmMySomethingProps>(
  ({ placeholder = "Howdy" }) => {
    return <div class={styles["elm-my-something"]}>{placeholder}</div>;
  },
);
