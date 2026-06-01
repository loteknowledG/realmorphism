import { resolveCatalogPickerValue } from "./catalog-to-rolling-items.tsx";

export const DEMO_FIGLET_FONTS = [
  "Standard",
  "Slant",
  "Big",
  "Block",
  "Bubble",
  "Digital",
  "ANSI Shadow",
  "ANSI Regular",
  "ANSI Compact",
  "Small",
  "Mini",
  "Script",
  "Shadow",
  "Speed",
  "Star Wars",
  "Univers",
  "Whimsy",
  "3-D",
  "3D Diagonal",
  "3D-ASCII",
  "3x5",
  "4Max",
  "5 Line Oblique",
  "5x7",
  "Alligator",
  "Alpha",
  "Avatar",
  "Banner",
  "Bell",
  "Benjamin",
] as const;

export type DemoFigletFont = (typeof DEMO_FIGLET_FONTS)[number];

export const DEFAULT_DEMO_FIGLET_FONT: DemoFigletFont = "Standard";

/** Tiny wheel previews — static demo art, not live figlet render. */
export const DEMO_FIGLET_WHEEL_PREVIEW: Record<string, string> = {
  Standard: "EM",
  Slant: "/EM\\",
  Big: "##",
  Block: "[]",
  Bubble: "oo",
  Digital: "01",
  "ANSI Shadow": "▓▓",
  "ANSI Regular": "ER",
  "ANSI Compact": "AC",
};

/** Detail panel samples keyed by font (subset; others fall back to label). */
export const DEMO_FIGLET_DETAIL_PREVIEW: Record<string, string> = {
  Standard: [
    "  _____ _   _ ",
    " | ____| | | |",
    " |  _| | |_| |",
    " | |___|  _  |",
    " |_____|_| |_|",
  ].join("\n"),
  "ANSI Compact": [
    "  ___  _   _ ",
    " / _ \\| | | |",
    " | (_) | |_| |",
    "  \\___/ \\__,_|",
  ].join("\n"),
  Big: [
    "  ____  _   _ ",
    " | __ )| | | |",
    " |  _ \\| |_| |",
    " | |_) |  _  |",
    " |____/|_| |_|",
  ].join("\n"),
};

export function resolveDemoFigletValue(value: string, fonts: readonly string[]): string {
  return resolveCatalogPickerValue(value, fonts);
}

export function demoFigletWheelPreview(font: string): string {
  return DEMO_FIGLET_WHEEL_PREVIEW[font] ?? font.slice(0, 2).toUpperCase();
}

export function demoFigletDetailPreview(font: string, text = "ECHO"): string {
  const sample = DEMO_FIGLET_DETAIL_PREVIEW[font];
  if (sample) return sample;
  return [
    `Font: ${font}`,
    "",
    `Preview: ${text}`,
    "(Connect figlet render for live output)",
  ].join("\n");
}
