import {
  $,
  component$,
  CSSProperties,
  useSignal,
  type Numberish,
} from "@builder.io/qwik";

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

  srcset?: string;

  sizes?: string;

  /**
   * Image alt text
   */
  alt?: string;

  enableModal?: boolean;

  caption?: string;

  width?: Numberish;

  height?: Numberish;

  style?: CSSProperties;
}

export const ElmBlockImage = component$<ElmBlockImageProps>(
  ({
    src,
    alt,
    caption,
    width,
    height,
    enableModal = true,
    srcset,
    sizes,
    style,
  }) => {
    const isLoading = useSignal(true);
    const isShowModal = useSignal(false);

    const handleImageLoad = $(() => {
      isLoading.value = false;
    });

    const handleToggleModal = $(() => {
      if (enableModal && !isLoading.value) {
        isShowModal.value = !isShowModal.value;
      }
    });

    const ImageComponent = (
      <img
        class={styles.image}
        src={src}
        alt={alt ?? caption ?? "Image"}
        srcset={srcset}
        sizes={sizes}
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
          "--aspect-ratio": width && height ? `${width} / ${height}` : "auto",
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
      <figure class={styles["block-image"]} style={style}>
        <div
          class={styles["image-container"]}
          style={{ "--opacity": isLoading.value ? 1 : 0 }}
          onClick$={handleToggleModal}
        >
          {ImageComponent}

          <div class={styles.fallback}>
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
