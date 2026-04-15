import React, { useCallback, useEffect, useRef, useState } from "react";

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

export interface ElmSelectOption {
  id: string;
  label?: string;
  description?: string;
  children?: React.ReactNode;
}

export type ElmSelectCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-color-primary"
>;

export interface ElmSelectProps {
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
  options: ElmSelectOption[];

  /** Currently selected option. */
  selectedOption?: ElmSelectOption | null;

  /** Called when an option is selected. */
  onSelect?: (option: ElmSelectOption) => void;
}

export const ElmSelect = ({
  disabled = false,
  loading = false,
  ...props
}: ElmSelectProps) => {
  const [isActive, setIsActive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (!disabled && !loading) {
      setIsActive((prev) => !prev);
    }
  }, [disabled, loading]);

  const { options, onSelect } = props;

  const handleSelect = useCallback(
    (id: string) => {
      const selected = options.find((option) => option.id === id);
      if (selected && onSelect) {
        onSelect(selected);
        setIsActive(false);
      }
    },
    [options, onSelect],
  );

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
            {props.selectedOption ? (
              props.selectedOption.children ? (
                <div>{props.selectedOption.children}</div>
              ) : (
                <div>
                  <span>{props.selectedOption.label}</span>
                  {props.selectedOption.description && (
                    <span className={styles.description}>
                      {props.selectedOption.description}
                    </span>
                  )}
                </div>
              )
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
              {props.options.map((option) => (
                <div
                  key={option.id}
                  className={styles.option}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.id);
                  }}
                >
                  <ElmMdiIcon
                    d={mdiChevronRight}
                    color="#868e9c"
                    size="0.75em"
                  />

                  {option.children ? (
                    <div>{option.children}</div>
                  ) : (
                    <>
                      <span>{option.label}</span>
                      {option.description && (
                        <span className={styles.description}>
                          {option.description}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
