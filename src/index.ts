export function fn() {
  return "Hello, tsdown!";
}

export { Button, buttonVariants } from "./components/ui/button.tsx";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card.tsx";

export { DocTypeRollingPicker } from "./components/doc-type-rolling-picker.tsx";
export { TextRollingPicker } from "./components/text-rolling-picker.tsx";
export {
  ShowroomFontPicker,
  type ShowroomFontWheelPreviewRender,
} from "./components/showroom-font-picker.tsx";
export { ShowroomFontPreviewSlide } from "./components/showroom-font-preview-slide.tsx";
export { ShowroomFontPreviewPanel } from "./components/showroom-font-preview-panel.tsx";

export { Knob } from "./components/ui/knob.tsx";
export {
  RollingPicker,
  type RollingPickerItem,
  type RollingPickerProps,
} from "./components/ui/rolling-picker.tsx";
export type {
  CompactRollingPickerProps,
  ExpandRollingPickerProps,
  ShowroomRollingPickerProps,
} from "./components/ui/rolling-picker-types.ts";

export { KitShowroom, type KitShowroomProps, type KitInstallCommand } from "./kit/kit-showroom.tsx";
export { KitKnobsSection } from "./kit/kit-knobs-section.tsx";
export { KitCompactRollingPickerSection } from "./kit/kit-compact-rolling-picker-section.tsx";
export {
  KitTextRollingPickerSection,
  type KitTextRollingPickerSectionProps,
} from "./kit/kit-text-rolling-picker-section.tsx";
export {
  KitShowroomFigletSection,
  type KitShowroomFigletSectionProps,
} from "./kit/kit-showroom-figlet-section.tsx";

export { DemoShowroom } from "./demo-showroom.tsx";

export {
  DEMO_TEXT_CATALOG,
  resolveDemoTextValue,
  type DemoTextCatalogEntry,
} from "./lib/demo-text-catalog.ts";
export {
  catalogToRollingItems,
  resolveCatalogPickerValue,
  rollingPickerLayoutForMode,
  type CatalogToRollingItemsOptions,
  type RollingPickerRowMode,
} from "./lib/catalog-to-rolling-items.tsx";
export {
  loopBoundaryWrapTarget,
  needsLoopJump,
  nextLoopIndex,
  normalizeIndex,
  prevLoopIndex,
  stepIndex,
} from "./lib/rolling-picker-loop.ts";
export {
  DEMO_FIGLET_FONTS,
  DEFAULT_DEMO_FIGLET_FONT,
  resolveDemoFigletValue,
  demoFigletDetailPreview,
  demoFigletWheelPreview,
} from "./lib/demo-figlet-catalog.ts";

export { InfoPane } from "./components/ui/info-pane.tsx";
export { TuiPanel } from "./components/ui/tui-panel.tsx";
export { Toggle, toggleVariants } from "./components/ui/toggle.tsx";
export { Input } from "./components/ui/input.tsx";
export { Label } from "./components/ui/label.tsx";
export { Switch } from "./components/ui/switch.tsx";
export { Checkbox } from "./components/ui/checkbox.tsx";
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
  tabsTriggerVariants,
} from "./components/ui/tabs.tsx";

export {
  REALMORPHISM_BUTTON_TAG,
  RealmorphismButtonElement,
  defineRealmorphismButton,
  realmorphismButtonMarkup,
} from "./realmorphism-button.ts";
