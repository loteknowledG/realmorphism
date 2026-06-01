import * as React from "react";

import { TextRollingPicker } from "../components/text-rolling-picker.tsx";
import {
  DEMO_TEXT_CATALOG,
  type DemoTextCatalogEntry,
} from "../lib/demo-text-catalog.ts";

export type KitTextRollingPickerSectionProps = {
  catalog?: DemoTextCatalogEntry[];
};

export function KitTextRollingPickerSection({
  catalog = DEMO_TEXT_CATALOG,
}: KitTextRollingPickerSectionProps) {
  const [artId, setArtId] = React.useState(catalog[0]?.id ?? "");
  const active =
    (artId ? catalog.find((entry) => entry.id === artId) : undefined) ?? catalog[0] ?? null;
  const currentIndex = active ? catalog.findIndex((entry) => entry.id === active.id) : -1;

  React.useEffect(() => {
    if (!catalog.length) return;
    if (catalog.some((entry) => entry.id === artId)) return;
    setArtId(catalog[0]?.id ?? "");
  }, [artId, catalog]);

  return (
    <section className="realmorphism-panel p-5">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Text Roller</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#9eada7]">
            Compact variant with title text in the toolbar roller. Spin to browse; the ASCII line lands
            in the detail panel when you stop—not in the wheel itself.
          </p>
        </div>
        <span className="font-mono text-xs text-[#7dffb4]">control · text</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:items-start">
        <div className="space-y-3">
          <div className="realmorphism-kit-toolbar flex min-h-7 min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden overscroll-contain px-3 py-2">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6f7a75]">
              1-line toolbar
            </span>
            <span className="mx-0.5 h-4 w-px shrink-0 bg-[#2a3530]" aria-hidden />
            <div className="flex h-7 min-w-0 flex-1" data-oneline-art-picker>
              <TextRollingPicker value={artId} onChange={setArtId} catalog={catalog} />
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6f7a75]">
              Detail panel (example: 1-line ascii)
            </span>
            <div className="realmorphism-panel flex min-h-[5rem] max-h-[5rem] flex-col justify-center overflow-hidden p-4">
              {active ? (
                <pre className="overflow-hidden font-mono text-[10px] leading-none whitespace-pre text-[#7dffb4]">
                  {active.content}
                </pre>
              ) : (
                <div className="font-mono text-xs text-[#6f7a75]">No catalog entries</div>
              )}
            </div>
          </div>
        </div>

        <div className="realmorphism-panel space-y-1 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f7a75]">
            Selected
          </div>
          {active ? (
            <>
              <div className="font-mono text-sm text-[#e8efeb]">{active.title}</div>
              <div className="font-mono text-xs text-[#7dffb4]">{active.id}</div>
              {catalog.length > 1 && currentIndex >= 0 ? (
                <div className="font-mono text-xs text-[#6f7a75]">
                  {currentIndex + 1} / {catalog.length}
                </div>
              ) : null}
            </>
          ) : (
            <div className="font-mono text-xs text-[#6f7a75]">…</div>
          )}
        </div>
      </div>
    </section>
  );
}
