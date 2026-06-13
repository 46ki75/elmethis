import {
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
} from "vue";
import { clsx } from "clsx";
import { mdiMessageImageOutline } from "@mdi/js";

import styles from "./elm-block-image.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmRectangleWave } from "../fallback/elm-rectangle-wave";
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
    const isLoading = ref(true);

    // The lightbox is a `useModal` instance: `isOpen` drives the zoom cursor,
    // `show`/`hide` open and close it, and `Modal` renders the native <dialog>.
    const {
      Modal: ImageModal,
      isOpen: isModalOpen,
      show: showModal,
      hide: hideModal,
    } = useModal();

    const imgRef = ref<HTMLImageElement | null>(null);

    // If the image is already cached when this mounts, `load` may never fire,
    // so settle the loading state via `decode()` too.
    const settle = (): void => {
      imgRef.value?.decode().then(
        () => (isLoading.value = false),
        () => {},
      );
    };
    onMounted(settle);
    watch(() => props.src, settle);

    const handleOpenModal = (): void => {
      if ((props.enableModal ?? true) && !isLoading.value) {
        showModal();
      }
    };

    const modalEnabled = () => props.enableModal ?? true;

    const renderImage = (isModal: boolean) => (
      <img
        // Only the inline image owns imgRef; the modal image must not steal it
        // (ElmModal keeps its slot mounted, so both can coexist in the DOM).
        ref={isModal ? undefined : imgRef}
        class={styles.image}
        src={props.src}
        alt={props.alt ?? props.caption ?? "Image"}
        srcset={isModal ? undefined : props.srcSet}
        sizes={isModal ? undefined : props.sizes}
        width={props.width}
        height={props.height}
        loading={isModal ? "lazy" : undefined}
        onLoad={() => (isLoading.value = false)}
        onClick={isModal ? () => hideModal() : undefined}
        style={
          {
            "--elmethis-scoped-opacity": isLoading.value ? 0.01 : 1,
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
        <div
          class={styles["image-container"]}
          style={
            {
              "--elmethis-scoped-opacity": isLoading.value ? 1 : 0.01,
            } as CSSProperties
          }
          onClick={handleOpenModal}
        >
          {renderImage(false)}

          <div class={styles.fallback}>
            <ElmRectangleWave />
          </div>
        </div>

        {props.caption && (
          <figcaption
            class={styles["caption-box"]}
            style={
              {
                "--elmethis-scoped-opacity": isLoading.value ? 0.01 : 1,
              } as CSSProperties
            }
          >
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
