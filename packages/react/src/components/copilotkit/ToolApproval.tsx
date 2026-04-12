import React from "react";
import { clsx } from "clsx";

// Styles
import "@styles/global.css";
import styles from "./ToolApproval.module.css";

// Components
import { mdiMinusCircle, mdiTools } from "@mdi/js";
import { ElmButton } from "@components/form/ElmButton";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

// Types
import { ToolCallStatus } from "@copilotkit/react-core/v2";

export type ToolApprovalCSSVariables = {};

export interface ToolApprovalProps {
  style?: React.CSSProperties & ToolApprovalCSSVariables;

  toolName: string;

  status: ToolCallStatus;

  approveLabel?: string;
  rejectLabel?: string;

  onApprove?: () => void;
  onReject?: () => void;

  resultContent: React.ReactNode;
}

export const ToolApproval = (props: ToolApprovalProps) => {
  return (
    <div
      className={clsx(styles["human-in-the-loop"], {
        [styles["in-progress"]]: props.status === ToolCallStatus.InProgress,
        [styles.executing]: props.status === ToolCallStatus.Executing,
        [styles.complete]: props.status === ToolCallStatus.Complete,
      })}
      style={props.style}
    >
      <div className={styles.message}>// TODO</div>

      <div className={styles["button-container"]}>
        <ElmButton
          onClick={props.onReject}
          block
          loading={props.status === ToolCallStatus.InProgress}
          disabled={props.status === ToolCallStatus.Complete}
        >
          <ElmMdiIcon d={mdiMinusCircle} />
          <ElmInlineText code>{props.rejectLabel || "Reject"}</ElmInlineText>
        </ElmButton>

        <ElmButton
          onClick={props.onApprove}
          block
          loading={props.status === ToolCallStatus.InProgress}
          disabled={props.status === ToolCallStatus.Complete}
        >
          <ElmMdiIcon d={mdiTools} />
          <ElmInlineText code>{props.approveLabel || "Approve"}</ElmInlineText>
        </ElmButton>
      </div>

      <div className={styles["result-container"]}>{props.resultContent}</div>
    </div>
  );
};
