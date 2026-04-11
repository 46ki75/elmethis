import React, { useCallback, useEffect, useState } from "react";

import "@styles/global.css";
import styles from "./ElmModal.module.css";

import { createPortal } from "react-dom";

export interface ElmModalCSSVariables {
  "--width"?: string;
}

export interface ElmModalProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmModalCSSVariables;

  /** Whether the modal is open. */
  value?: boolean;

  /** Called when the modal open state changes. */
  onChange?: (value: boolean) => void;

  /** Max width of the modal content. */
  width?: string;

  /** Whether clicking outside closes the modal. */
  closeOnClickOutside?: boolean;
}

export const ElmModal = ({
  closeOnClickOutside = true,
  onChange,
  ...props
}: ElmModalProps) => {
  const [visible, setVisible] = useState(false);

  const isOpen = props.value ?? false;

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
    if (closeOnClickOutside && onChange) {
      onChange(false);
    }
  }, [closeOnClickOutside, onChange]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen && !visible) return null;

  return createPortal(
    <div
      className={`${styles.provider} ${isOpen ? styles["provider-enter"] : styles["provider-exit"]}`}
      onClick={handleBackdropClick}
    >
      <div
        className={styles.modal}
        style={{
          "--width": props.width,
          ...props.style,
        } as React.CSSProperties}
        onClick={handleContentClick}
      >
        {props.children}
      </div>
    </div>,
    document.body,
  );
};
