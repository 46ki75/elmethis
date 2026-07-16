import { $, component$, PropsOf } from "@qwik.dev/core";

import styles from "./elm-block-image.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiMessageImageOutline } from "@mdi/js";
import { useModal } from "../../hooks/use-modal";

export interface ElmBlockImageProps extends PropsOf<"figure"> {
  /**
   * Image source URL
   */
  src: string;

  srcset?: string;

  sizes?: string;

  /**
   * Image alt text
   */
  alt?: string;

  enableModal?: boolean;

  caption?: string;

  width?: number | `${number}`;

  height?: number | `${number}`;
}

export const ElmBlockImage = component$<ElmBlockImageProps>((props) => {
  const {
    class: className,
    src,
    alt,
    caption,
    width,
    height,
    srcset,
    sizes,
    enableModal,
    ...rest
  } = props;
  // The lightbox is a `useModal` instance: `isOpen` drives the zoom cursor,
  // `show`/`hide` open and close it, and `<ImageModal>` renders the native
  // <dialog> (top layer, backdrop, Escape-to-close).
  const {
    Modal: ImageModal,
    isOpen: isModalOpen,
    show: showModal,
    hide: hideModal,
  } = useModal();

  const handleOpenModal = $(() => {
    if (props.enableModal ?? true) {
      showModal();
    }
  });

  // ElmModal stops content-click propagation, so the enlarged image must
  // close the lightbox itself (the backdrop-close only fires outside it).
  const handleCloseModal = $(() => {
    hideModal();
  });

  const ImageComponent = (isModal: boolean) => (
    <img
      class={styles.image}
      src={src}
      alt={alt ?? caption ?? "Image"}
      srcset={isModal ? undefined : srcset}
      sizes={isModal ? undefined : sizes}
      width={width}
      height={height}
      loading={isModal ? "lazy" : undefined}
      fetchPriority={isModal ? "low" : "auto"}
      onClick$={isModal ? handleCloseModal : undefined}
      style={{
        "--elmethis-scoped-cursor":
          (enableModal ?? true)
            ? isModalOpen.value
              ? "zoom-out"
              : "zoom-in"
            : "default",
        "--aspect-ratio": width && height ? `${width} / ${height}` : "auto",
      }}
    />
  );

  return (
    <figure class={[styles["elm-block-image"], className]} {...rest}>
      <div class={styles["image-container"]} onClick$={handleOpenModal}>
        {ImageComponent(false)}
      </div>

      {caption && (
        <figcaption class={styles["caption-box"]}>
          <span class={styles["caption-icon"]}>
            <ElmMdiIcon d={mdiMessageImageOutline} size="1.25rem" />
          </span>
          <ElmInlineText size="1rem">{caption}</ElmInlineText>
        </figcaption>
      )}

      {/* Render the enlarged image only while open so it stays lazy. */}
      <ImageModal>{isModalOpen.value && ImageComponent(true)}</ImageModal>
    </figure>
  );
});
