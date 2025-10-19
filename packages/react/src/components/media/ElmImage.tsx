import { useState, type ComponentProps, type CSSProperties } from "react";
import style from "./ElmImage.module.scss";
import { ElmInlineText } from "../typography/ElmInlineText";
import { mdiTooltipImage } from "@mdi/js";
import { ElmMdiIcon } from "../icon/ElmMdiIcon";

export interface ElmImageProps extends ComponentProps<"img"> {
  /**
   * Image source URL
   */
  src: string;

  /**
   * Image alt text
   */
  alt?: string;

  /**
   * inline or block
   */
  block?: boolean;

  /**
   * Enable modal on image click. Default: `false`
   */
  enableModal?: boolean;

  /**
   * The margin of the image.
   */
  margin?: CSSProperties["marginBlock"];
}

export const ElmImage = ({
  src,
  alt,
  block,
  enableModal = false,
  margin,
  ...args
}: ElmImageProps) => {
  const [isShowModal, setIsShowModal] = useState(false);

  const handleClick = () => {
    if (enableModal) setIsShowModal(!isShowModal);
  };

  const image = (
    <img
      className={style.image}
      src={src}
      alt={alt}
      style={{ cursor: enableModal && !isShowModal ? "zoom-in" : "unset" }}
      {...args}
      onClick={handleClick}
    />
  );
  const modal = (
    <div className={style.modal} onClick={handleClick}>
      {image}
    </div>
  );

  return (
    <div style={{ marginBlock: margin }} {...args}>
      {image}
      {alt && block && (
        <div className={style.caption}>
          <ElmMdiIcon d={mdiTooltipImage} color="#bfa056" size="1.25rem" />
          <ElmInlineText text={alt} />
        </div>
      )}
      {isShowModal && modal}
    </div>
  );
};
