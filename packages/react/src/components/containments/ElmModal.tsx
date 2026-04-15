import React, { useCallback, useEffect, useState } from "react";

import "@styles/global.css";
import styles from "./ElmModal.module.css";

import { createPortal } from "react-dom";
import clsx from "clsx";

export interface ElmModalCSSVariables {}

export interface ElmModalProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmModalCSSVariables;

  className?: string;

  /** Whether the modal is open. */
  isOpen?: boolean;

  /** Called when the modal open state changes. */
  setIsOpen?: (value: boolean) => void;

  /** Whether clicking outside closes the modal. */
  closeOnClickOutside?: boolean;
}

export const ElmModal = ({
  closeOnClickOutside = true,
  isOpen,
  setIsOpen,
  ...props
}: ElmModalProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    } else {
      const timeout = window.setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnClickOutside && setIsOpen) {
      setIsOpen(false);
    }
  }, [closeOnClickOutside, setIsOpen]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen && !visible) return null;

  return createPortal(
    <div
      className={clsx(styles.provider, {
        [styles["exit"]]: !isOpen,
      })}
      onClick={handleBackdropClick}
    >
      <div
        className={[styles.modal, props.className].filter(Boolean).join(" ")}
        style={props.style}
        onClick={handleContentClick}
      >
        {props.children}
      </div>
    </div>,
    document.body,
  );
};
