import { Show, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";
import { mdiMessageImageOutline } from "@mdi/js";

import { createModal } from "../../primitives/create-modal";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-block-image.module.css";

export interface ElmBlockImageProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Image source URL. */
  src: string;
  srcSet?: string;
  sizes?: string;
  /** Image alt text. */
  alt?: string;
  enableModal?: boolean;
  caption?: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
}

export const ElmBlockImage = (props: ElmBlockImageProps) => {
  const rest = omit(
    props,
    "class",
    "children",
    "src",
    "srcSet",
    "sizes",
    "alt",
    "enableModal",
    "caption",
    "width",
    "height",
  );
  const { Modal: ImageModal, isOpen, show, hide } = createModal();
  const enableModal = () => props.enableModal ?? true;

  const openModal = () => {
    if (enableModal()) {
      show();
    }
  };

  const image = (isModal: boolean) => (
    <img
      class={styles.image}
      src={props.src}
      alt={props.alt ?? props.caption ?? "Image"}
      srcset={isModal ? undefined : props.srcSet}
      sizes={isModal ? undefined : props.sizes}
      width={props.width}
      height={props.height}
      loading={isModal ? "lazy" : undefined}
      fetchpriority={isModal ? "low" : "auto"}
      onClick={isModal ? hide : undefined}
      style={{
        "--elmethis-scoped-cursor": enableModal()
          ? isOpen()
            ? "zoom-out"
            : "zoom-in"
          : "default",
        "--elmethis-scoped-aspect-ratio":
          props.width && props.height
            ? `${props.width} / ${props.height}`
            : "auto",
      }}
    />
  );

  return (
    <figure {...rest} class={clsx(styles["elm-block-image"], props.class)}>
      <div class={styles["image-container"]} onClick={openModal}>
        {image(false)}
      </div>

      <Show when={props.caption}>
        {(caption) => (
          <figcaption class={styles["caption-box"]}>
            <span class={styles["caption-icon"]}>
              <ElmMdiIcon path={mdiMessageImageOutline} size="1.25rem" />
            </span>
            <ElmInlineText size="1rem">{caption()}</ElmInlineText>
          </figcaption>
        )}
      </Show>

      <ImageModal>{isOpen() && image(true)}</ImageModal>
    </figure>
  );
};
