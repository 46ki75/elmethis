import React from "react";
import { clsx } from "clsx";

// Styles
import "@styles/global.css";
import styles from "./ToolApproval.module.css";

// Components
import { mdiCheckCircle, mdiHammerScrewdriver, mdiMinusCircle } from "@mdi/js";
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
      <div className={styles.message}>
        <ElmMdiIcon
          d={mdiHammerScrewdriver}
          color={
            {
              [ToolCallStatus.InProgress]: "#cdb57b",
              [ToolCallStatus.Executing]: "#6987b8",
              [ToolCallStatus.Complete]: "#59b57c",
            }[props.status]
          }
        />
        <ElmInlineText code style={{ fontSize: "1rem" }}>
          {props.toolName}
        </ElmInlineText>
      </div>

      <div className={styles["in-progress-container"]}>
        <ElmInlineText>Preparing...</ElmInlineText>
      </div>

      <div className={styles["executing-container"]}>
        <div>
          <ElmInlineText>
            LLM requests your approval to execute the tool.
          </ElmInlineText>
        </div>

        <div className={styles["button-container"]}>
          <ElmButton
            onClick={props.onReject}
            block
            loading={props.status === ToolCallStatus.InProgress}
            disabled={props.status === ToolCallStatus.Complete}
          >
            <span className={styles["button-inner"]}>
              <ElmMdiIcon d={mdiMinusCircle} />
              <ElmInlineText>{props.rejectLabel || "Reject"}</ElmInlineText>
            </span>
          </ElmButton>

          <ElmButton
            onClick={props.onApprove}
            block
            loading={props.status === ToolCallStatus.InProgress}
            disabled={props.status === ToolCallStatus.Complete}
          >
            <div className={styles["button-inner"]}>
              <ElmMdiIcon d={mdiCheckCircle} />
              <ElmInlineText>{props.approveLabel || "Approve"}</ElmInlineText>
            </div>
          </ElmButton>
        </div>
      </div>

      <div className={styles["result-container"]}>{props.resultContent}</div>
    </div>
  );
};
