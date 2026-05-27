import {
  $,
  component$,
  PropsOf,
  useSignal,
  useVisibleTask$,
} from "@qwik.dev/core";

import styles from "./elm-block-image.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmRectangleWave } from "../fallback/elm-rectangle-wave";
import { mdiMessageImageOutline } from "@mdi/js";

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
  const isLoading = useSignal(true);
  const isShowModal = useSignal(false);

  const handleImageLoad = $(() => {
    isLoading.value = false;
  });

  const handleToggleModal = $(() => {
    if ((props.enableModal ?? true) && !isLoading.value) {
      isShowModal.value = !isShowModal.value;
    }
  });

  const imgRef = useSignal<HTMLImageElement>();

  /**
   * @see {@link https://qwik.dev/docs/cookbook/detect-img-tag-onload/}
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    imgRef.value!.decode().then(() => {
      isLoading.value = false;
    });
  });

  const ImageComponent = (isModal: boolean) => (
    <img
      ref={imgRef}
      class={styles.image}
      src={src}
      alt={alt ?? caption ?? "Image"}
      srcset={isModal ? undefined : srcset}
      sizes={isModal ? undefined : sizes}
      width={width}
      height={height}
      loading={isModal ? "lazy" : undefined}
      fetchPriority={isModal ? "low" : "auto"}
      onLoad$={handleImageLoad}
      style={{
        "--elmethis-scoped-opacity": isLoading.value ? 0.01 : 1,
        "--elmethis-scoped-cursor":
          (enableModal ?? true)
            ? isShowModal.value
              ? "zoom-out"
              : "zoom-in"
            : "default",
        "--aspect-ratio": width && height ? `${width} / ${height}` : "auto",
      }}
    />
  );

  const Modal = (
    <div
      class={styles["modal-container"]}
      style={{
        pointerEvents: isShowModal.value ? "auto" : "none",
        "--elmethis-scoped-opacity": isShowModal.value ? 1 : 0,
      }}
      onClick$={handleToggleModal}
    >
      {isShowModal.value && ImageComponent(true)}
    </div>
  );

  return (
    <figure class={[styles["block-image"], className]} {...rest}>
      <div
        class={styles["image-container"]}
        style={{ "--elmethis-scoped-opacity": isLoading.value ? 1 : 0.01 }}
        onClick$={handleToggleModal}
      >
        {ImageComponent(false)}

        <div class={styles.fallback}>
          <ElmRectangleWave />
        </div>
      </div>

      {caption && (
        <figcaption
          class={styles["caption-box"]}
          style={{ "--elmethis-scoped-opacity": isLoading.value ? 0.01 : 1 }}
        >
          <span class={styles["caption-icon"]}>
            <ElmMdiIcon d={mdiMessageImageOutline} size="1.25rem" />
          </span>
          <ElmInlineText size="1rem">{caption}</ElmInlineText>
        </figcaption>
      )}

      {Modal}
    </figure>
  );
});
