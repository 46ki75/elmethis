import { $, component$, useSignal, type Numberish } from "@builder.io/qwik";

import styles from "./elm-block-image.module.scss";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
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

  caption?: string;

  width?: Numberish;

  height?: Numberish;
}

export const ElmBlockImage = component$<ElmBlockImageProps>(
  ({ src, alt, caption, width, height }) => {
    const isLoading = useSignal(true);

    const handleImageLoad = $(() => {
      isLoading.value = false;
    });

    const ImageComponent = (
      <img
        class={styles.image}
        src={src}
        alt={alt ?? caption ?? "Image"}
        width={width}
        height={height}
        onLoad$={handleImageLoad}
      />
    );

    return (
      <figure class={styles["block-image"]}>
        {ImageComponent}

        <div class={styles["fallback"]}></div>

        {caption && (
          <figcaption class={styles["caption-box"]}>
            <ElmMdiIcon
              d={mdiMessageImageOutline}
              color="#cdb57b"
              size="1.25rem"
            />
            <ElmInlineText>{caption}</ElmInlineText>
          </figcaption>
        )}
      </figure>
    );
  },
);
