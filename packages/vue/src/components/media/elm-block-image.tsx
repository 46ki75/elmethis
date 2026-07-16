import {
  defineComponent,
  h,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
} from "vue";
import { clsx } from "clsx";
import { mdiMessageImageOutline } from "@mdi/js";

import styles from "./elm-block-image.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { useModal } from "../../hooks/use-modal";

export interface ElmBlockImageProps extends HTMLAttributes {
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

export const ElmBlockImage = defineComponent({
  name: "ElmBlockImage",
  props: {
    src: { type: String, required: true },
    srcSet: { type: String, default: undefined },
    sizes: { type: String, default: undefined },
    alt: { type: String, default: undefined },
    enableModal: { type: Boolean, default: undefined },
    caption: { type: String, default: undefined },
    width: {
      type: [Number, String] as PropType<number | `${number}`>,
      default: undefined,
    },
    height: {
      type: [Number, String] as PropType<number | `${number}`>,
      default: undefined,
    },
  },
  setup(props) {
    // The lightbox is a `useModal` instance: `isOpen` drives the zoom cursor,
    // `show`/`hide` open and close it, and `Modal` renders the native <dialog>.
    const {
      Modal: ImageModal,
      isOpen: isModalOpen,
      show: showModal,
      hide: hideModal,
    } = useModal();

    const handleOpenModal = (): void => {
      if (props.enableModal ?? true) {
        showModal();
      }
    };

    const modalEnabled = () => props.enableModal ?? true;

    const renderImage = (isModal: boolean) => (
      <img
        class={styles.image}
        src={props.src}
        alt={props.alt ?? props.caption ?? "Image"}
        srcset={isModal ? undefined : props.srcSet}
        sizes={isModal ? undefined : props.sizes}
        width={props.width}
        height={props.height}
        loading={isModal ? "lazy" : undefined}
        onClick={isModal ? () => hideModal() : undefined}
        style={
          {
            "--elmethis-scoped-cursor": modalEnabled()
              ? isModalOpen.value
                ? "zoom-out"
                : "zoom-in"
              : "default",
            "--elmethis-scoped-aspect-ratio":
              props.width && props.height
                ? `${props.width} / ${props.height}`
                : "auto",
          } as CSSProperties
        }
        {...{ fetchpriority: isModal ? "low" : "auto" }}
      />
    );

    // inheritAttrs default: passthrough class/style merge onto the root figure.
    return () => (
      <figure class={clsx(styles["elm-block-image"])}>
        <div class={styles["image-container"]} onClick={handleOpenModal}>
          {renderImage(false)}
        </div>

        {props.caption && (
          <figcaption class={styles["caption-box"]}>
            <span class={styles["caption-icon"]}>
              <ElmMdiIcon d={mdiMessageImageOutline} size="1.25rem" />
            </span>
            <ElmInlineText size="1rem">{props.caption}</ElmInlineText>
          </figcaption>
        )}

        {/* Render the enlarged image only while open so it stays lazy. */}
        {h(ImageModal, null, {
          default: () => (isModalOpen.value ? renderImage(true) : null),
        })}
      </figure>
    );
  },
});
