import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmSelect.module.css";

import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import {
  mdiMenuDown,
  mdiChevronRight,
  mdiArrowDownDropCircleOutline,
} from "@mdi/js";
import type { ElmethisCSSVariables } from "@styles/variables";
import clsx from "clsx";

export interface ElmSelectOption<T extends string> {
  id: T;
  label?: string;
  description?: string;
  children?: React.ReactNode;
}

export type ElmSelectCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-color-primary"
>;

export interface ElmSelectProps<T extends string> {
  style?: React.CSSProperties & ElmSelectCSSVariables;

  className?: string;

  /** Label displayed above the select. */
  label: string;

  /** Placeholder text when no option is selected. */
  placeholder?: string;

  /** Whether the select is disabled. */
  disabled?: boolean;

  /** Whether the select is in loading state. */
  loading?: boolean;

  /** List of options. */
  options: ElmSelectOption<T>[];

  /** Currently selected option. */
  selectedOptionId?: T | null;

  /** Called when an option is selected. */
  onSelect?: (option: T) => void;
}

export const ElmSelect = <T extends string>({
  disabled = false,
  loading = false,
  ...props
}: ElmSelectProps<T>) => {
  const [isActive, setIsActive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsActive((prev) => !prev);
    }
  };

  const { options, onSelect } = props;

  const handleSelect = (id: T) => {
    const selected = options.find((option) => option.id === id);
    if (selected && onSelect) {
      onSelect(selected.id);
      setIsActive(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const optionContent = (id: T, isSelectable: boolean, key?: string) => {
    const option = props.options.find((option) => option.id === id);

    if (!option) {
      return null;
    }

    const onClick = isSelectable
      ? (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
          handleSelect(option.id);
        }
      : undefined;

    const innerContent = (
      <>
        {isSelectable && (
          <ElmMdiIcon d={mdiChevronRight} color="#868e9c" size="0.75em" />
        )}
        <span>{option.label}</span>
        {option.description && (
          <span className={styles.description}>{option.description}</span>
        )}
      </>
    );

    return (
      <div
        key={key}
        className={clsx(styles.option, {
          [styles.selectable]: isSelectable,
        })}
        onClick={onClick}
      >
        {option.children ? option.children : innerContent}
      </div>
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={clsx(styles.wrapper, props.className, {
        [styles.active]: isActive,
      })}
      style={{
        backgroundColor: disabled || loading ? "rgba(0,0,0,0.15)" : undefined,
        ...props.style,
      }}
      onClick={handleToggle}
    >
      <div className={styles.header}>
        <span className={styles.label}>{props.label}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.select}>
          <div className={styles.selected}>
            {props.selectedOptionId ? (
              optionContent(props.selectedOptionId, false)
            ) : (
              <div className={styles.fallback}>
                <ElmMdiIcon d={mdiArrowDownDropCircleOutline} />
                <span>{props.placeholder ?? "Select an option"}</span>
              </div>
            )}
          </div>

          <ElmMdiIcon d={mdiMenuDown} size="1.5rem" />

          <div
            className={clsx(styles.pulldown, {
              [styles.active]: isActive,
            })}
          >
            <div className={styles["collapse"]}>
              {props.options.map((option) =>
                optionContent(option.id, true, option.id),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
