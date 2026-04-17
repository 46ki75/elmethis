import React from "react";

import "@styles/global.css";
import styles from "./ElmModelSelect.module.css";
import { ElmSelect } from "@components/form/ElmSelect";
import { ElmInlineIcon } from "@components/icon/ElmInlineIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

export type ElmModelSelectOption<TModelId extends string> = {
  modelId: TModelId;
  label: string;
  icon: string;
};

export interface ElmModelSelectCSSVariables {}

export interface ElmModelSelectProps<TModelId extends string> {
  style?: React.CSSProperties & ElmModelSelectCSSVariables;

  models: ElmModelSelectOption<TModelId>[];

  selectedModelId?: TModelId | null;

  setSelectedModelId?: (modelId: TModelId) => void;
}

const convertToSelectOption = <TModelId extends string>(
  model: ElmModelSelectOption<TModelId>,
) => ({
  id: model.modelId,
  label: model.label,
  children: (
    <div className={styles["option"]}>
      <ElmInlineIcon
        src={model.icon}
        alt={model.label}
        className={styles.icon}
      />
      <ElmInlineText>{model.label}</ElmInlineText>
    </div>
  ),
});

export const ElmModelSelect = <TModelId extends string>(
  props: ElmModelSelectProps<TModelId>,
) => {
  const selectedOption = React.useMemo(() => {
    const model =
      props.models.find((model) => model.modelId === props.selectedModelId) ||
      null;

    if (!model) return null;

    return convertToSelectOption(model);
  }, [props.models, props.selectedModelId]);

  return (
    <ElmSelect
      label="Model"
      options={props.models.map(convertToSelectOption)}
      selectedOptionId={selectedOption?.id}
      onSelect={props.setSelectedModelId}
    />
  );
};
