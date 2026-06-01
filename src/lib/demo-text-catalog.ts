import { resolveCatalogPickerValue } from "./catalog-to-rolling-items.tsx";

export type DemoTextCatalogEntry = {
  id: string;
  title: string;
  content: string;
};

/** Standalone demo catalog for the kit text roller (no network). */
export const DEMO_TEXT_CATALOG: DemoTextCatalogEntry[] = [
  {
    id: "100-dollar",
    title: "100$",
    content: "  $$$$$\n $$  $$\n $$$$$$",
  },
  {
    id: "echo-line",
    title: "ECHO",
    content: "  ___  ___\n / _ \\/ _ \\\n|  __/  __/",
  },
  {
    id: "mirage-line",
    title: "MIRAGE",
    content: " __  __ ___\n|  \\/  |_ _|\n| |\\/| || |",
  },
  {
    id: "ops-ready",
    title: "OPS READY",
    content: " ___  ___ ___\n| _ \\| _ \\_ _|",
  },
  {
    id: "signal",
    title: "SIGNAL",
    content: " ___  ___\n/ __||__ \\\n\\__ \\|___/",
  },
];

export function resolveDemoTextValue(value: string, catalog: DemoTextCatalogEntry[]): string {
  return resolveCatalogPickerValue(value, catalog, (entry) => entry.id);
}
