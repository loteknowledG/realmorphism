import type { ReactNode } from "react";

import type { RollingPickerItem, RollingPickerProps } from "../components/ui/rolling-picker-types.ts";

export type RollingPickerRowMode = "compact" | "expand" | "showroom";

type CatalogRow = { value: string; label: string };

type EntryKeys<T> = {
  getValue?: (entry: T) => string;
  getLabel?: (entry: T) => string;
};

export type CatalogToRollingItemsOptions<T> =
  | (EntryKeys<T> & {
      mode: "compact";
      renderSlide: (entry: T) => ReactNode;
    })
  | (EntryKeys<T> & {
      mode: "expand";
      renderSlide: (entry: T) => ReactNode;
      /** Defaults to the same node as renderSlide. */
      renderLabelSlide?: (entry: T) => ReactNode;
    })
  | (EntryKeys<T> & {
      mode: "showroom";
      renderCenterSlide: (entry: T, active: boolean) => ReactNode;
      /** Defaults to label-only neighbor row. */
      renderNeighborSlide?: (entry: T, active: boolean) => ReactNode;
    });

function isStringCatalog(catalog: readonly unknown[]): catalog is readonly string[] {
  return catalog.length > 0 && typeof catalog[0] === "string";
}

function asCatalogRow(entry: unknown): CatalogRow {
  if (typeof entry === "string") {
    return { value: entry, label: entry };
  }
  if (typeof entry === "object" && entry !== null) {
    const row = entry as { value?: string; id?: string; label?: string; title?: string };
    const value = row.value ?? row.id ?? "";
    const label = row.label ?? row.title ?? value;
    return { value, label };
  }
  return { value: "", label: "" };
}

function entryKeys<T>(entry: T, options: EntryKeys<T>): CatalogRow {
  if (options.getValue || options.getLabel) {
    const keys = asCatalogRow(entry);
    return {
      value: options.getValue?.(entry) ?? keys.value,
      label: options.getLabel?.(entry) ?? keys.label,
    };
  }
  return asCatalogRow(entry);
}

/** Map any catalog into Embla wheel rows for compact, expand, or showroom pickers. */
export function catalogToRollingItems<T>(
  catalog: readonly T[] | readonly string[],
  options: CatalogToRollingItemsOptions<T>,
): RollingPickerItem[] {
  const rows = isStringCatalog(catalog) ? (catalog as readonly T[]) : catalog;

  return rows.map((entry) => {
    const { value, label } = entryKeys(entry, options);

    switch (options.mode) {
      case "compact":
        return {
          value,
          label,
          slide: options.renderSlide(entry),
        };
      case "expand": {
        const slide = options.renderSlide(entry);
        const labelSlide = options.renderLabelSlide?.(entry) ?? slide;
        return { value, label, slide, labelSlide };
      }
      case "showroom":
        return {
          value,
          label,
          renderSlide: (active) => options.renderCenterSlide(entry, active),
          renderLabelSlide: (active) =>
            options.renderNeighborSlide?.(entry, active) ?? (
              <span className="block max-w-full truncate px-1 font-mono text-[9px] leading-none tracking-[0.04em]">
                {label}
              </span>
            ),
        };
    }
  });
}

/** Clamp a controlled value to the nearest catalog id (case-insensitive). */
export function resolveCatalogPickerValue<T>(
  value: string,
  catalog: readonly T[] | readonly string[],
  getValue?: (entry: T) => string,
): string {
  if (!catalog.length) return value;

  const rows = isStringCatalog(catalog)
    ? catalog.map((entry) => ({ value: entry, label: entry }))
    : catalog.map((entry) => entryKeys(entry, { getValue }));

  const match = rows.find((row) => row.value.toLowerCase() === value.toLowerCase());
  return match?.value ?? rows[0]?.value ?? value;
}

const EXPAND_LAYOUT: Partial<RollingPickerProps> = {
  wheelExpandOnScroll: true,
  wheelNeighborCount: 3,
  slideHeightPx: 28,
  wheelScrollStep: 1,
  showTextWhileScrolling: false,
  wheelSettledShowsSlide: false,
  alwaysShowLabel: true,
  loop: true,
};

const SHOWROOM_LAYOUT: Partial<RollingPickerProps> = {
  wheelExpandOnScroll: true,
  wheelPinnedOpen: true,
  wheelNeighborCount: 3,
  slideHeightPx: 44,
  wheelScrollStep: 1,
  showTextWhileScrolling: false,
  wheelSettledShowsSlide: false,
  loop: true,
};

const COMPACT_LAYOUT: Partial<RollingPickerProps> = {
  showTextWhileScrolling: true,
  loop: true,
};

/** Preset RollingPicker layout flags for each kit roller mode. */
export function rollingPickerLayoutForMode(
  mode: RollingPickerRowMode,
  overrides?: Partial<RollingPickerProps>,
): Partial<RollingPickerProps> {
  const base =
    mode === "showroom" ? SHOWROOM_LAYOUT : mode === "expand" ? EXPAND_LAYOUT : COMPACT_LAYOUT;
  return { ...base, ...overrides };
}
