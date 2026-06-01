import { cn } from "../lib/utils.ts";
import { demoFigletWheelPreview } from "../lib/demo-figlet-catalog.ts";

type ShowroomFontPreviewSlideProps = {
  font: string;
  active: boolean;
  size?: "wheel" | "lg";
};

export function ShowroomFontPreviewSlide({
  font,
  active,
  size = "wheel",
}: ShowroomFontPreviewSlideProps) {
  const preview = demoFigletWheelPreview(font);
  const isLarge = size === "lg";

  return (
    <div className="flex w-full min-w-0 flex-col items-center justify-center gap-0.5">
      <pre
        className={cn(
          "w-full overflow-hidden text-center font-mono whitespace-pre",
          isLarge
            ? "max-h-[10rem] text-[9px] leading-[0.68]"
            : "max-h-[1.35rem] text-[5px] leading-[0.58]",
          active
            ? "text-emerald-200 drop-shadow-[0_0_6px_rgba(125,255,180,0.35)]"
            : "text-[#4a524e]",
        )}
        aria-hidden
      >
        {preview}
      </pre>
      <span
        className={cn(
          "max-w-full truncate px-0.5 font-mono leading-none tracking-[0.03em]",
          isLarge ? "text-[10px]" : "text-[7px]",
          active ? "text-emerald-200" : "text-[#4a524e]",
        )}
      >
        {font}
      </span>
    </div>
  );
}
