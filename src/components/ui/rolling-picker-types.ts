import type { ReactNode } from "react";

/** One row in a Y-axis rolling picker wheel. */
export type RollingPickerItem = {
  value: string;
  label: string;
  slide?: ReactNode;
  /** Receives whether this row is the wheel center (for active/inactive styling). */
  renderSlide?: (active: boolean) => ReactNode;
  labelSlide?: ReactNode;
  renderLabelSlide?: (active: boolean) => ReactNode;
};

/** Shared props for all rolling picker layouts (compact toolbar, expand-inline, showroom). */
export type RollingPickerProps = {
  items: RollingPickerItem[];
  value: string;
  onChange: (value: string) => void;
  onUserSelect?: (value: string) => void;
  ariaLabel: string;
  viewportClassName?: string;
  showTextWhileScrolling?: boolean;
  alwaysShowLabel?: boolean;
  /** Compact toolbar: brief snap label above the wheel after user spin. */
  showSnapHint?: boolean;
  /** Expand-inline: neighbors visible while scrolling (glyph toolbar strip). */
  wheelExpandOnScroll?: boolean;
  /** Showroom: full-height wheel with neighbors always visible. */
  wheelPinnedOpen?: boolean;
  wheelTransparent?: boolean;
  wheelNeighborCount?: number;
  slideHeightPx?: number;
  wheelScrollStep?: number;
  wheelMomentum?: boolean;
  wheelMomentumGain?: number;
  wheelMomentumFriction?: number;
  wheelMomentumDuration?: number;
  /** While spinning show label; when snapped show slide (title → rich preview). */
  wheelSettledShowsSlide?: boolean;
  inlinePanelClassName?: string;
  wheelFullWidth?: boolean;
  /** Embla infinite loop — on for every multi-item wheel unless explicitly disabled. */
  loop?: boolean;
  /** E2E / kit selector: compact | expand | showroom */
  rollerType?: string;
};

/** Compact icon or short-label toolbar roller (operator doc type, engine switch). */
export type CompactRollingPickerProps = Pick<
  RollingPickerProps,
  | "items"
  | "value"
  | "onChange"
  | "onUserSelect"
  | "ariaLabel"
  | "viewportClassName"
  | "showTextWhileScrolling"
  | "alwaysShowLabel"
  | "showSnapHint"
  | "loop"
  | "rollerType"
>;

/** Full-width toolbar strip with neighbor band (1-line title roller). */
export type ExpandRollingPickerProps = CompactRollingPickerProps &
  Pick<
    RollingPickerProps,
    | "wheelExpandOnScroll"
    | "wheelTransparent"
    | "wheelNeighborCount"
    | "slideHeightPx"
    | "wheelScrollStep"
    | "wheelMomentum"
    | "wheelMomentumGain"
    | "wheelMomentumFriction"
    | "wheelMomentumDuration"
    | "wheelSettledShowsSlide"
    | "inlinePanelClassName"
    | "wheelFullWidth"
  > & {
    wheelExpandOnScroll: true;
  };

/** Pinned square showroom wheel with rich center row + text neighbors. */
export type ShowroomRollingPickerProps = Pick<
  RollingPickerProps,
  | "items"
  | "value"
  | "onChange"
  | "onUserSelect"
  | "ariaLabel"
  | "viewportClassName"
  | "wheelNeighborCount"
  | "slideHeightPx"
  | "wheelScrollStep"
  | "wheelMomentum"
  | "loop"
  | "rollerType"
> & {
  wheelExpandOnScroll: true;
  wheelPinnedOpen: true;
};
