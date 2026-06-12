import {
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { clsx } from "clsx";

import styles from "./elm-tooltip.module.css";

export interface ElmTooltipProps extends ComponentPropsWithoutRef<"span"> {
  /** The always-visible trigger content (qwik `q:slot="original"`). */
  original?: ReactNode;

  /** The content revealed on hover (qwik `q:slot="tooltip"`). */
  tooltip?: ReactNode;
}

export const ElmTooltip = ({
  className,
  original,
  tooltip,
  onMouseOver,
  onMouseLeave,
  ...props
}: ElmTooltipProps) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const [isHover, setIsHover] = useState(false);
  const isHideScheduleRef = useRef(false);
  const hideTimerIdRef = useRef<number>(undefined);
  const [position, setPosition] = useState<CSSProperties>({});

  const handleMouseOver = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      const el = elRef.current;
      if (!el) return;

      if (isHideScheduleRef.current) {
        window.clearTimeout(hideTimerIdRef.current);
        isHideScheduleRef.current = false;
      }

      const rect = el.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      if (rect.x > windowWidth / 2) {
        setPosition({
          top: `${rect.bottom}px`,
          right: `${windowWidth - rect.x - rect.width}px`,
        });
      } else {
        setPosition({
          top: `${rect.bottom}px`,
          left: `${rect.x}px`,
        });
      }

      setIsHover(true);
      onMouseOver?.(event);
    },
    [onMouseOver],
  );

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      if (!isHideScheduleRef.current) {
        isHideScheduleRef.current = true;

        hideTimerIdRef.current = window.setTimeout(() => {
          isHideScheduleRef.current = false;
          setIsHover(false);
        }, 250);
      }

      onMouseLeave?.(event);
    },
    [onMouseLeave],
  );

  return (
    <span
      ref={elRef}
      className={clsx(styles["elm-tooltip"], className)}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {original}

      <div
        className={clsx(styles.tooltip, isHover && styles.show)}
        style={position}
      >
        {tooltip}
      </div>
    </span>
  );
};
