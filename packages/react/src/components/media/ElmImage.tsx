import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import style from "./ElmImage.module.scss";
import { ElmInlineText } from "../typography/ElmInlineText";
import { mdiTooltipImage } from "@mdi/js";
import { ElmMdiIcon } from "../icon/ElmMdiIcon";
import { CSSTransition } from "react-transition-group";

import "../../styles/transition.scss";

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
  const nodeRef = useRef(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <div style={{ marginBlock: margin }} {...args}>
      {image}
      {alt && block && (
        <div className={style.caption}>
          <ElmMdiIcon d={mdiTooltipImage} color="#bfa056" size="1.25rem" />
          <ElmInlineText text={alt} />
        </div>
      )}

      {isMounted && enableModal && (
        <CSSTransition
          classNames="fade"
          in={isShowModal}
          timeout={300}
          unmountOnExit
          nodeRef={nodeRef}
        >
          <div className={style.modal} onClick={handleClick} ref={nodeRef}>
            {image}
          </div>
        </CSSTransition>
      )}
    </div>
  );
};
