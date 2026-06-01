import * as React from "react";

import { RollingPicker } from "./ui/rolling-picker.tsx";
import { cn } from "../lib/utils.ts";
import {
  catalogToRollingItems,
  resolveCatalogPickerValue,
  rollingPickerLayoutForMode,
} from "../lib/catalog-to-rolling-items.tsx";
import {
  DEMO_TEXT_CATALOG,
  type DemoTextCatalogEntry,
} from "../lib/demo-text-catalog.ts";

const TITLE_SLIDE_CLASS =
  "flex w-full min-w-0 items-center justify-center overflow-hidden whitespace-nowrap px-1 font-mono text-[8px] leading-none tracking-[0.02em]";

type TextRollingPickerProps = {
  value: string;
  onChange: (value: string) => void;
  catalog?: DemoTextCatalogEntry[];
  onUserSelect?: (value: string) => void;
};

function titleSlide(title: string) {
  return (
    <span
      data-oneline-title
      className={cn(TITLE_SLIDE_CLASS, "text-emerald-200/95")}
      title={title}
    >
      {title}
    </span>
  );
}

/** Expand-inline text toolbar roller — title in wheel, detail elsewhere. */
export function TextRollingPicker({
  value,
  onChange,
  catalog = DEMO_TEXT_CATALOG,
  onUserSelect,
}: TextRollingPickerProps) {
  const items = React.useMemo(
    () =>
      catalogToRollingItems(catalog, {
        mode: "expand",
        getValue: (entry) => entry.id,
        getLabel: (entry) => entry.title,
        renderSlide: (entry) => titleSlide(entry.title),
      }),
    [catalog],
  );

  const resolvedValue = resolveCatalogPickerValue(value, catalog, (entry) => entry.id);

  React.useEffect(() => {
    if (resolvedValue === value) return;
    onChange(resolvedValue);
  }, [resolvedValue, value, onChange]);

  if (catalog.length === 0) {
    return (
      <div className="flex h-7 w-full min-w-0 flex-1 items-center justify-center rounded border border-[#2d2d2d] bg-black px-1 font-mono text-[8px] text-[#6a6a6a]">
        …
      </div>
    );
  }

  return (
    <RollingPicker
      items={items}
      value={resolvedValue}
      onChange={onChange}
      onUserSelect={onUserSelect}
      ariaLabel="One-line ASCII art"
      rollerType="expand"
      viewportClassName="h-7 min-w-0 w-full max-w-none overflow-hidden [scrollbar-width:none]"
      wheelTransparent
      wheelFullWidth
      {...rollingPickerLayoutForMode("expand")}
    />
  );
}
