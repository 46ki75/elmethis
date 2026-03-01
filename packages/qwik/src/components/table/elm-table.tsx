import {
  component$,
  Slot,
  createContextId,
  useContextProvider,
  useComputed$,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { CSSProperties } from "@builder.io/qwik";
import styles from "./elm-table.scoped.scss?inline";
import textStyles from "../../styles/text.scoped.scss?inline";
import { ElmInlineText } from "../typography/elm-inline-text";

export const HasRowHeaderContext = createContextId<
  Readonly<{ value: boolean }>
>("HasRowHeaderContext");

export interface ElmTableProps {
  /**
   * The margin of the table.
   */
  margin?: CSSProperties["marginBlock"];

  caption?: string;

  hasRowHeader?: boolean;
}

export const ElmTable = component$<ElmTableProps>((props) => {
  useStylesScoped$(styles);
  useStylesScoped$(textStyles);

  const { margin, caption, hasRowHeader = false } = props;

  const hasRowHeaderComputed = useComputed$(() => hasRowHeader);
  useContextProvider(HasRowHeaderContext, hasRowHeaderComputed);

  return (
    <table
      class={["table", "text"]}
      style={{
        "--margin-block": margin,
      }}
    >
      {caption && (
        <caption>
          <span class="caption">
            <span class="spacing"></span>

            <span class="caption-inner">
              <svg viewBox="0 0 24 24" width="1rem" height="1rem">
                <path
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
                  fill="#6987b8"
                />
              </svg>
              <ElmInlineText text={caption} />
            </span>

            <span class="spacing"></span>
          </span>
        </caption>
      )}
      <Slot />
    </table>
  );
});
