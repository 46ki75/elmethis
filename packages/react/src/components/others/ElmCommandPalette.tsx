import React, { useCallback, useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmCommandPalette.module.css";

import { mdiConsoleLine, mdiKeyboardReturn } from "@mdi/js";
import { opacify } from "polished";

import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

const TAG_COLOR_MAP = {
  brown: "#a17c5b",
  crimson: "#c56565",
  amber: "#d48b70",
  gold: "#cdb57b",
  emerald: "#59b57c",
  cyan: "#59a7b5",
  blue: "#6987b8",
  purple: "#9771bd",
  pink: "#c9699e",
} as const;

export interface Command {
  id: string;
  icon?: string;
  label: string;
  tag?: {
    name: string;
    color: keyof typeof TAG_COLOR_MAP;
  };
  description?: string;
  keywords?: string[];
  onInvoke?: () => void;
}

export interface ElmCommandPaletteProps {
  style?: React.CSSProperties;

  commands: Command[];
  onCommandInvoked?: (command?: Command) => void;
}

function filterCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(lower) ||
      cmd.description?.toLowerCase().includes(lower) ||
      cmd.keywords?.some((kw) => kw.toLowerCase().includes(lower)),
  );
}

export const ElmCommandPalette = ({
  commands,
  onCommandInvoked,
  style,
}: ElmCommandPaletteProps) => {
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInput(val);
      const results = filterCommands(commands, val);
      setSearchResults(results);
      setSelectedIndex(results.length > 0 ? 0 : null);
    },
    [commands],
  );

  const invoke = useCallback(
    (index: number | null) => {
      if (index === null) return;
      const cmd = searchResults[index];
      if (cmd) {
        cmd.onInvoke?.();
        onCommandInvoked?.(cmd);
      }
    },
    [searchResults, onCommandInvoked],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "Tab") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return prev < searchResults.length - 1 ? prev + 1 : prev;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return prev > 0 ? prev - 1 : 0;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        invoke(selectedIndex);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [invoke, selectedIndex, searchResults.length]);

  return (
    <div
      className={styles.palette}
      style={{ "--height": "500px", "--width": "800px", ...style } as React.CSSProperties}
    >
      <header className={styles.header}>
        <ElmMdiIcon d={mdiConsoleLine} />
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={handleInput}
          type="text"
          inputMode="text"
        />
      </header>

      <div className={styles.body}>
        {searchResults.length === 0 ? (
          <div className={styles["empty-result"]}>
            <ElmInlineText>search anything...</ElmInlineText>
          </div>
        ) : (
          searchResults.map((command, index) => (
            <button
              key={command.id}
              className={`${styles.command} ${index === selectedIndex ? styles["command-selected"] : ""}`}
              onClick={() => {
                setSelectedIndex(index);
                invoke(index);
              }}
            >
              {command.icon ? (
                <img
                  className={styles["command-icon"]}
                  src={command.icon}
                  alt={command.label}
                />
              ) : (
                <ElmMdiIcon d={mdiConsoleLine} size="1rem" />
              )}

              {command.tag ? (
                <div
                  className={styles.tag}
                  style={{
                    "--tag-color": opacify(
                      -0.3,
                      TAG_COLOR_MAP[command.tag.color],
                    ),
                  } as React.CSSProperties}
                >
                  {command.tag.name}
                </div>
              ) : (
                <div className={styles.tag} />
              )}

              <ElmInlineText
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "24rem",
                }}
              >
                {command.label}
              </ElmInlineText>

              <ElmInlineText
                style={{
                  opacity: 0.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {command.description ?? "-"}
              </ElmInlineText>

              <div>
                <ElmMdiIcon d={mdiKeyboardReturn} />
              </div>
            </button>
          ))
        )}
      </div>

      <footer className={styles.footer}>
        <ElmInlineText kbd>Esc</ElmInlineText>
        <ElmInlineText>Close</ElmInlineText>
      </footer>
    </div>
  );
};
