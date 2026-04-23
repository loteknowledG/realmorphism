import * as React from "react";

import { Button } from "./button.tsx";
import { cn } from "../../lib/utils.ts";

function SendGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export type TuiPanelProps = {
  /** Title strip (e.g. session or bus name). */
  title?: string;
  /** Small label on the right of the title bar. */
  status?: string;
  /** Log / transcript lines (already formatted). */
  lines: readonly string[];
  /** Prompt prefix before the input. */
  prompt?: string;
  /**
   * Called when the user presses Enter in the command line (trimmed non-empty text).
   * If omitted, the input is still shown but disabled until you wire a handler.
   */
  onSubmitLine?: (line: string) => void;
  /** Hide the command line entirely (read-only log). */
  showCommandLine?: boolean;
  inputPlaceholder?: string;
  /** Disable typing even when `onSubmitLine` is set. */
  inputDisabled?: boolean;
  /** Enable ArrowUp/ArrowDown command history navigation at textarea boundaries. */
  enableHistoryNavigation?: boolean;
  /** Visual treatment for the panel shell. */
  colorMode?: "neutral" | "color";
  /** Accent palette for color mode (2 or 3 colors). */
  colorPalette?: readonly [string, string, string?];
  /** Max height of the scrollback region (Tailwind class). */
  scrollMaxHeightClassName?: string;
  /** Shown below the composer (e.g. session stats); typical AI-chat “context” strip. */
  dataPanel?: React.ReactNode;
  className?: string;
};

/**
 * Mechanical “web TUI” surface: bezel, mono scrollback, REPL-style user input.
 */
export function TuiPanel({
  title = "SESSION",
  status = "ONLINE",
  lines,
  prompt = ">",
  onSubmitLine,
  showCommandLine = true,
  inputPlaceholder = "enter command…",
  inputDisabled = false,
  enableHistoryNavigation = true,
  colorMode = "neutral",
  colorPalette = ["oklch(0.78 0.16 220)", "oklch(0.72 0.16 305)"],
  scrollMaxHeightClassName = "max-h-56",
  dataPanel,
  className,
}: TuiPanelProps) {
  const [draft, setDraft] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number | null>(null);
  const [draftBeforeHistory, setDraftBeforeHistory] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputActive = Boolean(onSubmitLine) && !inputDisabled;
  const placeholder = !onSubmitLine
    ? "Wire onSubmitLine(…) to enable input"
    : inputDisabled
      ? "Input disabled"
      : inputPlaceholder;

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = () => {
    const text = draft.trim();
    if (!text || !onSubmitLine || inputDisabled) return;
    onSubmitLine(text);
    setHistory((current) => {
      if (current[current.length - 1] === text) return current;
      return [...current, text];
    });
    setHistoryIndex(null);
    setDraftBeforeHistory("");
    setDraft("");
  };

  const getCursorLineInfo = (value: string, selectionStart: number) => {
    const clampedStart = Math.max(0, Math.min(selectionStart, value.length));
    const before = value.slice(0, clampedStart);
    const currentLineStart = before.lastIndexOf("\n") + 1;
    const currentLineEndIndex = value.indexOf("\n", clampedStart);
    const currentLineEnd = currentLineEndIndex === -1 ? value.length : currentLineEndIndex;
    const isAtFirstLine = currentLineStart === 0;
    const isAtLastLine = currentLineEnd === value.length;
    return { isAtFirstLine, isAtLastLine };
  };

  const canSend = inputActive && draft.trim().length > 0;
  const isColorMode = colorMode === "color";
  const [colorA, colorB, colorC = colorB] = colorPalette;
  const colorVars = {
    "--tui-color-a": colorA,
    "--tui-color-b": colorB,
    "--tui-color-c": colorC,
  } as React.CSSProperties;

  return (
    <div
      data-slot="tui-panel"
      style={isColorMode ? colorVars : undefined}
      className={cn(
        isColorMode
          ? "overflow-hidden rounded-lg border border-[color:color-mix(in_oklch,var(--tui-color-a)_60%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--tui-color-a)_12%,transparent)_0%,color-mix(in_oklch,var(--tui-color-c)_8%,transparent)_48%,color-mix(in_oklch,var(--tui-color-b)_14%,transparent)_100%)] font-mono text-[11px] leading-snug ring-1 ring-[color:color-mix(in_oklch,var(--tui-color-a)_35%,transparent)] shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/0.1),inset_0_-1px_0_0_color-mix(in_oklch,var(--tui-color-b)_45%,transparent)]"
          : "overflow-hidden rounded-lg border border-primary/35 bg-background/90 font-mono text-[11px] leading-snug ring-1 ring-primary/15 shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/0.08),inset_0_-1px_0_0_hsl(0_0%_0%_/0.4)] dark:bg-background/95 dark:shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/0.06),inset_0_-1px_0_0_hsl(0_0%_0%_/0.6)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]",
          isColorMode
            ? "border-[color:color-mix(in_oklch,var(--tui-color-a)_45%,transparent)] bg-[linear-gradient(90deg,color-mix(in_oklch,var(--tui-color-a)_22%,transparent)_0%,color-mix(in_oklch,var(--tui-color-c)_14%,transparent)_50%,color-mix(in_oklch,var(--tui-color-b)_20%,transparent)_100%)] text-foreground"
            : "border-border/70 bg-muted/25 text-muted-foreground",
        )}
      >
        <span className="truncate text-foreground/85">{title}</span>
        <span
          className={cn(
            "shrink-0 text-[9px] tracking-widest",
            isColorMode
              ? "text-[color:color-mix(in_oklch,var(--tui-color-a)_70%,var(--foreground))]"
              : "text-muted-foreground/90",
          )}
        >
          {status}
        </span>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "min-h-[14rem] overflow-y-auto overscroll-contain px-3 py-2.5 text-foreground/90",
          scrollMaxHeightClassName,
        )}
        role="log"
        aria-live="polite"
      >
        {lines.length === 0 ? (
          <div className="text-muted-foreground/80">— no output —</div>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground/88">
            {lines.join("\n")}
          </pre>
        )}
      </div>

      {showCommandLine ? (
        <div
          className={cn(
            "border-t",
            isColorMode
              ? "border-[color:color-mix(in_oklch,var(--tui-color-a)_45%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--tui-color-a)_8%,transparent)_0%,color-mix(in_oklch,var(--tui-color-b)_8%,transparent)_100%)]"
              : "border-border/70 bg-muted/30",
          )}
        >
          <form
            className="flex items-end gap-2 px-2 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <span
              className="shrink-0 select-none pb-2 font-mono text-xs text-primary"
              aria-hidden="true"
            >
              {prompt}
            </span>
            <textarea
              name="tui-command"
              rows={2}
              value={draft}
              onChange={(e) => {
                if (historyIndex !== null) {
                  setHistoryIndex(null);
                }
                setDraft(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                  return;
                }

                if (
                  enableHistoryNavigation &&
                  (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                  history.length > 0
                ) {
                  const { isAtFirstLine, isAtLastLine } = getCursorLineInfo(
                    e.currentTarget.value,
                    e.currentTarget.selectionStart,
                  );
                  const shouldNavigateHistory =
                    (e.key === "ArrowUp" && isAtFirstLine) ||
                    (e.key === "ArrowDown" && isAtLastLine);

                  if (!shouldNavigateHistory) return;

                  e.preventDefault();

                  if (e.key === "ArrowUp") {
                    if (historyIndex === null) {
                      setDraftBeforeHistory(draft);
                      const nextIndex = history.length - 1;
                      setHistoryIndex(nextIndex);
                      setDraft(history[nextIndex] ?? "");
                      return;
                    }

                    const nextIndex = Math.max(0, historyIndex - 1);
                    setHistoryIndex(nextIndex);
                    setDraft(history[nextIndex] ?? "");
                    return;
                  }

                  if (historyIndex === null) {
                    return;
                  }

                  if (historyIndex < history.length - 1) {
                    const nextIndex = historyIndex + 1;
                    setHistoryIndex(nextIndex);
                    setDraft(history[nextIndex] ?? "");
                    return;
                  }

                  setHistoryIndex(null);
                  setDraft(draftBeforeHistory);
                }
              }}
              placeholder={placeholder}
              disabled={!inputActive}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="TUI command input"
              className={cn(
                "min-h-[2.75rem] min-w-0 flex-1 resize-y rounded-md border border-border/60 bg-background/80 px-2 py-2 font-mono text-xs leading-relaxed text-foreground outline-none ring-offset-background focus-visible:border-primary/45 focus-visible:ring-1 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60",
                isColorMode &&
                  "border-[color:color-mix(in_oklch,var(--tui-color-a)_55%,transparent)] bg-[color:color-mix(in_oklch,var(--tui-color-a)_7%,transparent)] focus-visible:border-[color:color-mix(in_oklch,var(--tui-color-a)_75%,transparent)] focus-visible:ring-[color:color-mix(in_oklch,var(--tui-color-b)_45%,transparent)]",
                "placeholder:text-muted-foreground/55",
                "max-h-40",
              )}
            />
            <Button
              type="submit"
              size="icon"
              variant="default"
              disabled={!canSend}
              className="mb-px shrink-0 rounded-full"
              aria-label="Send"
              title="Send (Enter — Shift+Enter for newline)"
            >
              <SendGlyph className="size-4" />
            </Button>
          </form>

          {dataPanel ? (
            <div
              className={cn(
                "border-t px-3 py-2.5 text-[10px] leading-relaxed text-foreground/85",
                isColorMode
                  ? "border-[color:color-mix(in_oklch,var(--tui-color-a)_45%,transparent)] bg-[linear-gradient(90deg,color-mix(in_oklch,var(--tui-color-a)_10%,transparent)_0%,color-mix(in_oklch,var(--tui-color-c)_8%,transparent)_50%,color-mix(in_oklch,var(--tui-color-b)_10%,transparent)_100%)]"
                  : "border-border/60 bg-background/55",
              )}
            >
              {dataPanel}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
