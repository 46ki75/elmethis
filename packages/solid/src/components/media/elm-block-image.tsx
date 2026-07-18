import { mergeProps, Show, splitProps, type JSX } from "solid-js";
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
  const merged = mergeProps({ enableModal: true }, props);
  const [local, rest] = splitProps(merged, [
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
  ]);
  const { Modal: ImageModal, isOpen, show, hide } = createModal();

  const openModal = () => {
    if (local.enableModal) show();
  };

  const image = (isModal: boolean) => (
    <img
      class={styles.image}
      src={local.src}
      alt={local.alt ?? local.caption ?? "Image"}
      srcset={isModal ? undefined : local.srcSet}
      sizes={isModal ? undefined : local.sizes}
      width={local.width}
      height={local.height}
      loading={isModal ? "lazy" : undefined}
      fetchpriority={isModal ? "low" : "auto"}
      onClick={isModal ? hide : undefined}
      style={{
        "--elmethis-scoped-cursor": local.enableModal
          ? isOpen()
            ? "zoom-out"
            : "zoom-in"
          : "default",
        "--elmethis-scoped-aspect-ratio":
          local.width && local.height
            ? `${local.width} / ${local.height}`
            : "auto",
      }}
    />
  );

  return (
    <figure {...rest} class={clsx(styles["elm-block-image"], local.class)}>
      <div class={styles["image-container"]} onClick={openModal}>
        {image(false)}
      </div>

      <Show when={local.caption}>
        {(caption) => (
          <figcaption class={styles["caption-box"]}>
            <span class={styles["caption-icon"]}>
              <ElmMdiIcon d={mdiMessageImageOutline} size="1.25rem" />
            </span>
            <ElmInlineText size="1rem">{caption()}</ElmInlineText>
          </figcaption>
        )}
      </Show>

      <ImageModal>{isOpen() && image(true)}</ImageModal>
    </figure>
  );
};
