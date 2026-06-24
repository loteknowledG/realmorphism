import * as React from "react";

import {
  DEFAULT_DEMO_FIGLET_FONT,
  DEMO_FIGLET_FONTS,
  resolveDemoFigletValue,
} from "../lib/demo-figlet-catalog.ts";
import {
  ShowroomFontPicker,
  type ShowroomFontWheelPreviewRender,
} from "../components/showroom-font-picker.tsx";
import { ShowroomFontPreviewPanel } from "../components/showroom-font-preview-panel.tsx";

export type KitShowroomFigletSectionProps = {
  fonts?: readonly string[];
  defaultFont?: string;
  previewText?: string;
  renderWheelPreview?: ShowroomFontWheelPreviewRender;
  renderDetailPreview?: (font: string, previewText: string) => React.ReactNode;
};

export function KitShowroomFigletSection({
  fonts = DEMO_FIGLET_FONTS,
  defaultFont = DEFAULT_DEMO_FIGLET_FONT,
  previewText = "ECHO",
  renderWheelPreview,
  renderDetailPreview,
}: KitShowroomFigletSectionProps) {
  const [font, setFont] = React.useState(defaultFont);
  const resolved = resolveDemoFigletValue(font, fonts);
  const currentIndex = fonts.findIndex((name) => name.toLowerCase() === resolved.toLowerCase());

  React.useEffect(() => {
    if (resolved === font) return;
    setFont(resolved);
  }, [resolved, font]);

  return (
    <section className="realmorphism-panel p-5">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Rolling Picker</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#9eada7]">
            Showroom variant for long lists: a square wheel with a mirrored band, momentum scroll, and
            a selection row that can show rich preview plus label. Off-band rows stay text-only so the
            layout does not jump when you stop.
          </p>
        </div>
        <span className="font-mono text-xs text-[#7dffb4]">control · showroom</span>
      </div>

      <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex w-full min-w-0 shrink-0 flex-col items-center gap-3 xl:w-auto">
          <div
            data-kit-showroom-wheel
            className="realmorphism-kit-toolbar flex w-fit max-w-full justify-center"
          >
            <ShowroomFontPicker
              variant="showroom"
              value={font}
              onChange={setFont}
              fonts={fonts}
              renderWheelPreview={renderWheelPreview}
            />
          </div>

          <div className="realmorphism-panel w-full max-w-[10.5rem] space-y-1 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f7a75]">
              Selected
            </div>
            <div className="font-mono text-sm text-[#e8efeb]">{resolved}</div>
            {fonts.length > 1 && currentIndex >= 0 ? (
              <div className="font-mono text-xs text-[#6f7a75]">
                {currentIndex + 1} / {fonts.length}
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6f7a75]">
            Detail panel (example: figlet)
          </span>
          {renderDetailPreview ? (
            renderDetailPreview(resolved, previewText)
          ) : (
            <ShowroomFontPreviewPanel font={resolved} text={previewText} />
          )}
        </div>
      </div>
    </section>
  );
}
