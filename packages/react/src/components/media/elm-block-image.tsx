import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { clsx } from "clsx";
import { mdiMessageImageOutline } from "@mdi/js";

import styles from "./elm-block-image.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmRectangleWave } from "../fallback/elm-rectangle-wave";
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
  const [isLoading, setIsLoading] = useState(true);

  // The lightbox is a `useModal` instance: `isOpen` drives the zoom cursor,
  // `show`/`hide` open and close it, and `<ImageModal>` renders the native
  // <dialog> (top layer, backdrop, Escape-to-close).
  const {
    Modal: ImageModal,
    isOpen: isModalOpen,
    show: showModal,
    hide: hideModal,
  } = useModal();

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleOpenModal = () => {
    if ((enableModal ?? true) && !isLoading) {
      showModal();
    }
  };

  // ElmModal stops content-click propagation, so the enlarged image must
  // close the lightbox itself (the backdrop-close only fires outside it).
  const handleCloseModal = () => {
    hideModal();
  };

  const imgRef = useRef<HTMLImageElement>(null);

  /**
   * @see {@link https://qwik.dev/docs/cookbook/detect-img-tag-onload/}
   *
   * If the image is already cached when this mounts, `onLoad` may never fire,
   * so settle the loading state via `decode()` too.
   */
  useEffect(() => {
    imgRef.current?.decode().then(
      () => setIsLoading(false),
      () => {},
    );
  }, [src]);

  const ImageComponent = (isModal: boolean) => (
    <img
      // Only the inline image owns imgRef; the modal image must not steal it
      // (ElmModal keeps its slot mounted, so both can coexist in the DOM).
      ref={isModal ? undefined : imgRef}
      className={styles.image}
      src={src}
      alt={alt ?? caption ?? "Image"}
      srcSet={isModal ? undefined : srcSet}
      sizes={isModal ? undefined : sizes}
      width={width}
      height={height}
      loading={isModal ? "lazy" : undefined}
      fetchPriority={isModal ? "low" : "auto"}
      onLoad={handleImageLoad}
      onClick={isModal ? handleCloseModal : undefined}
      style={
        {
          "--elmethis-scoped-opacity": isLoading ? 0.01 : 1,
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
      <div
        className={styles["image-container"]}
        style={
          {
            "--elmethis-scoped-opacity": isLoading ? 1 : 0.01,
          } as CSSProperties
        }
        onClick={handleOpenModal}
      >
        {ImageComponent(false)}

        <div className={styles.fallback}>
          <ElmRectangleWave />
        </div>
      </div>

      {caption && (
        <figcaption
          className={styles["caption-box"]}
          style={
            {
              "--elmethis-scoped-opacity": isLoading ? 0.01 : 1,
            } as CSSProperties
          }
        >
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
