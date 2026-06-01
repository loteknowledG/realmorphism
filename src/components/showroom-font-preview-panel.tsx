import * as React from "react";

import { cn } from "../lib/utils.ts";
import { demoFigletDetailPreview } from "../lib/demo-figlet-catalog.ts";

type ShowroomFontPreviewPanelProps = {
  font: string;
  text?: string;
  className?: string;
  /** Echo Mirage injects live figlet render output. */
  children?: React.ReactNode;
};

export function ShowroomFontPreviewPanel({
  font,
  text = "ECHO",
  className,
  children,
}: ShowroomFontPreviewPanelProps) {
  const output = children ?? demoFigletDetailPreview(font, text);

  return (
    <div
      className={cn(
        "realmorphism-panel flex min-h-[12rem] flex-col justify-center overflow-x-auto overflow-y-hidden p-4",
        className,
      )}
    >
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f7a75]">
        Preview
      </div>
      {typeof output === "string" ? (
        <pre className="overflow-x-auto overflow-y-hidden font-mono text-[10px] leading-[0.72] text-[#7dffb4] whitespace-pre">
          {output}
        </pre>
      ) : (
        output
      )}
    </div>
  );
}
