import { $, component$, useSignal, type Numberish } from "@builder.io/qwik";

import styles from "./elm-block-image.module.scss";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmRectangleWave } from "../fallback/elm-rectangle-wave";
import { mdiMessageImageOutline } from "@mdi/js";

export interface ElmBlockImageProps {
  /**
   * Image source URL
   */
  src: string;

  /**
   * Image alt text
   */
  alt?: string;

  enableModal?: boolean;

  caption?: string;

  width?: Numberish;

  height?: Numberish;
}

export const ElmBlockImage = component$<ElmBlockImageProps>(
  ({ src, alt, caption, width, height, enableModal = true }) => {
    const isLoading = useSignal(true);
    const isShowModal = useSignal(false);

    const handleImageLoad = $(() => {
      isLoading.value = false;
    });

    const handleToggleModal = $(() => {
      if (enableModal) {
        isShowModal.value = !isShowModal.value;
      }
    });

    const ImageComponent = (
      <img
        class={[styles.image]}
        src={src}
        alt={alt ?? caption ?? "Image"}
        width={width}
        height={height}
        onLoad$={handleImageLoad}
        style={{
          "--opacity": isLoading.value ? 0 : 1,
          "--cursor": enableModal
            ? isShowModal.value
              ? "zoom-out"
              : "zoom-in"
            : "default",
        }}
      />
    );

    const Modal = (
      <div
        class={styles["modal-container"]}
        style={{
          pointerEvents: isShowModal.value ? "auto" : "none",
          "--opacity": isShowModal.value ? 1 : 0,
        }}
        onClick$={handleToggleModal}
      >
        {ImageComponent}
      </div>
    );

    return (
      <figure class={styles["block-image"]}>
        <div
          class={styles["image-container"]}
          style={{ "--opacity": isLoading.value ? 1 : 0 }}
          onClick$={handleToggleModal}
        >
          {ImageComponent}

          <div class={styles["fallback"]}>
            <ElmRectangleWave />
          </div>
        </div>

        {caption && (
          <figcaption
            class={styles["caption-box"]}
            style={{ "--opacity": isLoading.value ? 0 : 1 }}
          >
            <span style={{ flex: "1" }}>
              <ElmMdiIcon
                d={mdiMessageImageOutline}
                color="#cdb57b"
                size="1.25rem"
              />
            </span>
            <ElmInlineText size="1rem">{caption}</ElmInlineText>
          </figcaption>
        )}

        {Modal}
      </figure>
    );
  },
);
