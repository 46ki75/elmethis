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
  ...props
}: ElmConfirmModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = useCallback(() => {
    if (props.onChange) props.onChange(false);
  }, [props.onChange]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await props.onConfirm();
      setLoading(false);
      if (props.onChange) props.onChange(false);
      if (props.onSuccess) props.onSuccess();
    } catch (e) {
      if (props.onError) props.onError(e);
      setLoading(false);
      if (props.onChange) props.onChange(false);
    }
  }, [props.onConfirm, props.onSuccess, props.onError, props.onChange]);

  return (
    <ElmModal
      value={props.value}
      onChange={props.onChange}
      closeOnClickOutside={closeOnClickOutside}
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
