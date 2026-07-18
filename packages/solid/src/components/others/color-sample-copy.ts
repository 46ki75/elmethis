import { createSignal, onCleanup, type Accessor } from "solid-js";

export type CopyMode = "variable" | "hex";

export interface ColorSampleCopyController {
  copiedToken: Accessor<string | null>;
  copyMode: Accessor<CopyMode>;
  toggleCopyMode: () => void;
  copyToken: (event: MouseEvent) => Promise<void>;
}

const rgbToHex = (rgb: string): string | null => {
  const parts = rgb.match(/\d+(?:\.\d+)?/g);
  if (!parts || parts.length < 3) return null;

  const channel = (part: string) =>
    Math.max(0, Math.min(255, Math.round(Number(part))))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(parts[0])}${channel(parts[1])}${channel(parts[2])}`;
};

export const createColorSampleCopy = (): ColorSampleCopyController => {
  const [copiedToken, setCopiedToken] = createSignal<string | null>(null);
  const [copyMode, setCopyMode] = createSignal<CopyMode>("variable");
  let resetTimerId: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  onCleanup(() => {
    disposed = true;
    if (resetTimerId !== undefined) clearTimeout(resetTimerId);
  });

  const copyToken = async (event: MouseEvent): Promise<void> => {
    const target = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-copy-token]",
    );
    const token = target?.dataset.copyToken;
    if (!target || !token) return;

    const view = target.ownerDocument.defaultView;
    const clipboard = view?.navigator.clipboard;
    if (!view || !clipboard) return;

    let text = token;
    if (copyMode() === "hex") {
      const root =
        target.closest<HTMLElement>("[data-theme]") ??
        target.ownerDocument.documentElement;
      const probe = target.ownerDocument.createElement("span");
      probe.style.color = `var(${token})`;
      probe.style.display = "none";
      root.append(probe);

      try {
        text = rgbToHex(view.getComputedStyle(probe).color) ?? token;
      } finally {
        probe.remove();
      }
    }

    await clipboard.writeText(text);
    if (disposed) return;

    if (resetTimerId !== undefined) clearTimeout(resetTimerId);
    setCopiedToken(token);
    resetTimerId = setTimeout(() => {
      setCopiedToken(null);
      resetTimerId = undefined;
    }, 1500);
  };

  return {
    copiedToken,
    copyMode,
    toggleCopyMode: () =>
      setCopyMode((mode) => (mode === "variable" ? "hex" : "variable")),
    copyToken,
  };
};
