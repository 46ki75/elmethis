import React, { useCallback, useState } from "react";

import "@styles/global.css";
import styles from "./ElmConfirmModal.module.css";

import { ElmModal } from "@components/containments/ElmModal";
import { ElmButton } from "@components/form/ElmButton";
import { ElmHeading } from "@components/typography/ElmHeading";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { mdiArrowLeft, mdiCheckCircle } from "@mdi/js";

export interface ElmConfirmModalCSSVariables {}

export interface ElmConfirmModalProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmConfirmModalCSSVariables;

  className?: string;

  /** Title displayed in the modal header. */
  title: string;

  /** Whether the modal is open. */
  value?: boolean;

  /** Called when the modal open state changes. */
  onChange?: (value: boolean) => void;

  /** Whether clicking outside closes the modal. */
  closeOnClickOutside?: boolean;

  /** Called when the confirm button is clicked. */
  onConfirm: () => void | Promise<void>;

  /** Called after a successful confirmation. */
  onSuccess?: () => void;

  /** Called if the confirmation throws an error. */
  onError?: (error: unknown) => void;
}

export const ElmConfirmModal = ({
  closeOnClickOutside = true,
  onChange,
  onConfirm,
  onSuccess,
  onError,
  ...props
}: ElmConfirmModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = useCallback(() => {
    if (onChange) onChange(false);
  }, [onChange]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await onConfirm();
      setLoading(false);
      if (onChange) onChange(false);
      if (onSuccess) onSuccess();
    } catch (e) {
      if (onError) onError(e);
      setLoading(false);
      if (onChange) onChange(false);
    }
  }, [onConfirm, onSuccess, onError, onChange]);

  return (
    <ElmModal
      isOpen={props.value}
      setIsOpen={onChange}
      closeOnClickOutside={closeOnClickOutside}
      className={props.className}
    >
      <div>
        <ElmHeading level={2} disableFragmentIdentifier>
          {props.title}
        </ElmHeading>

        <div className={styles.body}>{props.children}</div>

        <div className={styles.button}>
          <ElmButton block onClick={handleCancel} loading={loading}>
            <ElmMdiIcon d={mdiArrowLeft} />
            <span>Cancel</span>
          </ElmButton>

          <ElmButton block onClick={handleConfirm} primary loading={loading}>
            <ElmMdiIcon d={mdiCheckCircle} color="currentColor" />
            <span>Confirm</span>
          </ElmButton>
        </div>
      </div>
    </ElmModal>
  );
};
