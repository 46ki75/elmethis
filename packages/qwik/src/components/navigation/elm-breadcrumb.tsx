import {
  component$,
  type QRLEventHandlerMulti,
  useStylesScoped$,
} from "@builder.io/qwik";

import styles from "./elm-breadcrumb.scoped.scss?inline";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import {
  mdiApplicationOutline,
  mdiChevronRight,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmBreadcrumbProps {
  links: Array<{
    /**
     * The text to display.
     */
    text: string;

    /**
     * The action to perform when the link is clicked.
     */
    onClick$?: QRLEventHandlerMulti<PointerEvent, HTMLElement>;
  }>;
}

export const ElmBreadcrumb = component$<ElmBreadcrumbProps>(({ links }) => {
  useStylesScoped$(styles);
  return (
    <nav class="container">
      {links.map((link, index) => (
        <>
          <span class="link-container" onClick$={link.onClick$}>
            <span
              class="icon"
              style={{
                "--delay": `${index * 100}ms`,
              }}
            >
              <ElmMdiIcon
                d={
                  index === 0
                    ? mdiHome
                    : index === links.length - 1
                      ? mdiApplicationOutline
                      : mdiFolderOpen
                }
                size="1.25em"
              />
            </span>

            <span
              class="text"
              style={{
                "--delay": `${index * 100 + 50}ms`,
              }}
            >
              <ElmInlineText>{link.text}</ElmInlineText>
            </span>
          </span>

          {links.length !== index + 1 && (
            <span class="text" style={{ "--delay": `${index * 100 + 100}ms` }}>
              <ElmMdiIcon d={mdiChevronRight} size="1em" color="#b69545" />
            </span>
          )}
        </>
      ))}
    </nav>
  );
});
