import {
  component$,
  PropsOf,
  Slot,
  useContextProvider,
  useSignal,
  useTask$,
} from "@qwik.dev/core";
import styles from "./elm-table.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { HasRowHeaderContext } from "./table-context";

export interface ElmTableProps extends PropsOf<"table"> {
  caption?: string;

  hasRowHeader?: boolean;
}

export const ElmTable = component$<ElmTableProps>((props) => {
  const {
    class: className,
    caption,
    hasRowHeader: _hasRowHeader,
    ...rest
  } = props;

  const hasRowHeader = useSignal(props.hasRowHeader ?? false);
  useTask$(({ track }) => {
    hasRowHeader.value = track(() => props.hasRowHeader) ?? false;
  });
  useContextProvider(HasRowHeaderContext, hasRowHeader);

  return (
    <table class={[styles.table, textStyles.text, className]} {...rest}>
      {caption && (
        <caption>
          <span class={styles.caption}>
            <span class={styles.spacing}></span>

            <span class={styles["caption-inner"]}>
              <ElmInlineText>{caption}</ElmInlineText>
            </span>

            <span class={styles.spacing}></span>
          </span>
        </caption>
      )}
      <Slot />
    </table>
  );
});
