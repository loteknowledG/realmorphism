import * as React from "react";

import { ShowroomFontPreviewSlide } from "./showroom-font-preview-slide.tsx";
import { RollingPicker } from "./ui/rolling-picker.tsx";
import { cn } from "../lib/utils.ts";
import {
  catalogToRollingItems,
  resolveCatalogPickerValue,
  rollingPickerLayoutForMode,
} from "../lib/catalog-to-rolling-items.tsx";
import {
  DEFAULT_DEMO_FIGLET_FONT,
  DEMO_FIGLET_FONTS,
} from "../lib/demo-figlet-catalog.ts";

const FONT_SLIDE_CLASS =
  "flex w-full min-w-0 items-center justify-center overflow-hidden whitespace-nowrap px-1 font-mono text-[8px] leading-none tracking-[0.04em]";

export type ShowroomFontWheelPreviewRender = (font: string, active: boolean) => React.ReactNode;

type ShowroomFontPickerProps = {
  value: string;
  onChange: (font: string) => void;
  fonts?: readonly string[];
  onWheelSettled?: () => void;
  /** Echo Mirage can inject live figlet wheel previews. */
  renderWheelPreview?: ShowroomFontWheelPreviewRender;
  variant?: "compact" | "showroom";
};

function fontSlide(font: string) {
  return (
    <span className={FONT_SLIDE_CLASS} title={font}>
      {font}
    </span>
  );
}

function neighborFontSlide(font: string, active: boolean) {
  return (
    <span
      className={cn(
        "flex h-full max-w-full items-center truncate px-1 font-mono text-[9px] leading-none tracking-[0.04em]",
        active ? "text-emerald-200/90" : "text-[#84968e]",
      )}
    >
      {font}
    </span>
  );
}

/** Y-axis font rolodex — showroom mode shows rich center row + text neighbors. */
export function ShowroomFontPicker({
  value,
  onChange,
  fonts = DEMO_FIGLET_FONTS,
  onWheelSettled,
  renderWheelPreview,
  variant = "showroom",
}: ShowroomFontPickerProps) {
  const isShowroom = variant === "showroom";

  const items = React.useMemo(() => {
    if (!isShowroom) {
      return catalogToRollingItems(fonts, {
        mode: "compact",
        renderSlide: (font) => fontSlide(font),
      });
    }

    return catalogToRollingItems(fonts, {
      mode: "showroom",
      renderCenterSlide: (font, active) =>
        renderWheelPreview ? (
          renderWheelPreview(font, active)
        ) : (
          <ShowroomFontPreviewSlide font={font} active={active} size="wheel" />
        ),
      renderNeighborSlide: (font, active) => neighborFontSlide(font, active),
    });
  }, [fonts, isShowroom, renderWheelPreview]);

  const resolvedValue = resolveCatalogPickerValue(value, fonts);

  React.useEffect(() => {
    if (resolvedValue === value) return;
    onChange(resolvedValue);
  }, [resolvedValue, value, onChange]);

  return (
    <RollingPicker
      items={items}
      value={resolvedValue}
      onChange={onChange}
      onUserSelect={() => onWheelSettled?.()}
      ariaLabel="Figlet font"
      rollerType={isShowroom ? "showroom" : "compact"}
      viewportClassName={
        isShowroom
          ? "w-full"
          : "h-7 min-w-0 w-full max-w-none overflow-hidden rounded border border-[#2d2d2d] bg-black [scrollbar-width:none]"
      }
      wheelTransparent={false}
      {...(isShowroom
        ? rollingPickerLayoutForMode("showroom")
        : {
            slideHeightPx: 28,
            wheelScrollStep: 1,
            showTextWhileScrolling: false,
            wheelSettledShowsSlide: false,
            loop: true,
          })}
    />
  );
}

export { DEFAULT_DEMO_FIGLET_FONT };
