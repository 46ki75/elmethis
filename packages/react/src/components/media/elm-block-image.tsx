import { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { clsx } from "clsx";
import { mdiMessageImageOutline } from "@mdi/js";

import styles from "./elm-block-image.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { useModal } from "../../hooks/use-modal";

export interface ElmBlockImageProps extends ComponentPropsWithoutRef<"figure"> {
  /**
   * Image source URL
   */
  src: string;

  srcSet?: string;

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

export const ElmBlockImage = ({
  className,
  src,
  alt,
  caption,
  width,
  height,
  srcSet,
  sizes,
  enableModal,
  ...rest
}: ElmBlockImageProps) => {
  // The lightbox is a `useModal` instance: `isOpen` drives the zoom cursor,
  // `show`/`hide` open and close it, and `<ImageModal>` renders the native
  // <dialog> (top layer, backdrop, Escape-to-close).
  const {
    Modal: ImageModal,
    isOpen: isModalOpen,
    show: showModal,
    hide: hideModal,
  } = useModal();

  const handleOpenModal = () => {
    if (enableModal ?? true) {
      showModal();
    }
  };

  // ElmModal stops content-click propagation, so the enlarged image must
  // close the lightbox itself (the backdrop-close only fires outside it).
  const handleCloseModal = () => {
    hideModal();
  };

  const ImageComponent = (isModal: boolean) => (
    <img
      className={styles.image}
      src={src}
      alt={alt ?? caption ?? "Image"}
      srcSet={isModal ? undefined : srcSet}
      sizes={isModal ? undefined : sizes}
      width={width}
      height={height}
      loading={isModal ? "lazy" : undefined}
      fetchPriority={isModal ? "low" : "auto"}
      onClick={isModal ? handleCloseModal : undefined}
      style={
        {
          "--elmethis-scoped-cursor":
            (enableModal ?? true)
              ? isModalOpen
                ? "zoom-out"
                : "zoom-in"
              : "default",
          "--elmethis-scoped-aspect-ratio":
            width && height ? `${width} / ${height}` : "auto",
        } as CSSProperties
      }
    />
  );

  return (
    <figure className={clsx(styles["elm-block-image"], className)} {...rest}>
      <div className={styles["image-container"]} onClick={handleOpenModal}>
        {ImageComponent(false)}
      </div>

      {caption && (
        <figcaption className={styles["caption-box"]}>
          <span className={styles["caption-icon"]}>
            <ElmMdiIcon d={mdiMessageImageOutline} size="1.25rem" />
          </span>
          <ElmInlineText size="1rem">{caption}</ElmInlineText>
        </figcaption>
      )}

      {/* Render the enlarged image only while open so it stays lazy. */}
      <ImageModal>{isModalOpen && ImageComponent(true)}</ImageModal>
    </figure>
  );
};
