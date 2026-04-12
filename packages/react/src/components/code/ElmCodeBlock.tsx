import React, { useCallback, useEffect, useRef, useState } from "react";
import "@styles/global.css";
import styles from "./ElmCodeBlock.module.css";
import {
  mdiClipboardMultipleOutline,
  mdiClipboardCheckMultipleOutline,
} from "@mdi/js";
import { ElmLanguageIcon } from "@components/icon/ElmLanguageIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmDotLoadingIcon } from "@components/icon/ElmDotLoadingIcon";
import { ElmShikiHighlighter } from "./ElmShikiHighlighter";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmCodeBlockCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmCodeBlockProps {
  style?: React.CSSProperties & ElmCodeBlockCSSVariables;
  code: string;
  language?: string;
  caption?: string;
}

export const ElmCodeBlock = ({
  code,
  language = "txt",
  caption,
  style,
}: ElmCodeBlockProps) => {
  const [isRendered, setIsRendered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [stableCode, setStableCode] = useState(code);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce code updates to avoid thrashing the highlighter during streaming
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStableCode(code);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCopy = useCallback(() => {
    // Use live `code`, not `stableCode`, so the copy is always up to date
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{
        opacity: isVisible ? 1 : 0,
        ...style,
      }}
    >
      <div className={styles.header}>
        <div className={styles.header__left}>
          <ElmLanguageIcon language={language} size={20} />
          <span className={styles.caption}>
            <ElmInlineText>{caption ?? language}</ElmInlineText>
          </span>
        </div>
        <div className={styles.header__right}>
          <div className={styles["copy-icon"]} onClick={handleCopy}>
            <ElmMdiIcon
              size="1.25em"
              d={
                copied
                  ? mdiClipboardCheckMultipleOutline
                  : mdiClipboardMultipleOutline
              }
              useThemeColor={copied}
            />
          </div>
        </div>
      </div>

      <div className={styles.code}>
        <div
          className={styles["code-body"]}
          style={{ opacity: isRendered ? 1 : 0 }}
        >
          <ElmShikiHighlighter
            code={stableCode}
            language={language}
            onRendered={setIsRendered}
          />
        </div>

        <div
          className={styles.fallback}
          style={{ opacity: isRendered ? 0 : 1 }}
        >
          <ElmDotLoadingIcon size="48px" />
        </div>
      </div>
    </div>
  );
};
