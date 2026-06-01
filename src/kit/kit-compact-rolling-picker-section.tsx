import * as React from "react";

import { DocTypeRollingPicker } from "../components/doc-type-rolling-picker.tsx";
import { DOC_TYPE_ENTRIES, type DocTypeValue } from "../lib/doc-type-icon.ts";

export function KitCompactRollingPickerSection() {
  const [docType, setDocType] = React.useState<DocTypeValue>("markdown");
  const activeLabel = DOC_TYPE_ENTRIES.find((entry) => entry.value === docType)?.label ?? docType;

  return (
    <section className="realmorphism-panel p-5">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Rolling Picker</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#9eada7]">
            Compact toolbar variant of the same control: one visible row in the bar, neighbors on while
            you spin, icon when settled. Document types below are demo data only.
          </p>
        </div>
        <span className="font-mono text-xs text-[#7dffb4]">control · compact</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:items-center">
        <div className="realmorphism-kit-toolbar flex flex-wrap items-center gap-1.5 px-3 py-2">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6f7a75]">
            Operator toolbar
          </span>
          <span className="mx-0.5 h-4 w-px shrink-0 bg-[#2a3530]" aria-hidden />
          <DocTypeRollingPicker value={docType} onChange={setDocType} />
        </div>

        <div className="realmorphism-panel space-y-1 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f7a75]">
            Selected
          </div>
          <div className="font-mono text-sm text-[#e8efeb]">{activeLabel}</div>
          <div className="font-mono text-xs text-[#7dffb4]">{docType}</div>
        </div>
      </div>
    </section>
  );
}
