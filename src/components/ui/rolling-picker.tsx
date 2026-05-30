import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "../../lib/utils.ts";

const SNAP_ALIGN_THRESHOLD_PX = 0.5;
const SNAP_HINT_VISIBLE_MS = 1400;
const WHEEL_DELTA_TRIGGER_PX = 4;

export type RollingPickerItem = {
  value: string;
  label: string;
  slide: ReactNode;
  labelSlide?: ReactNode;
};

export type RollingPickerProps = {
  items: RollingPickerItem[];
  value: string;
  onChange: (value: string) => void;
  onUserSelect?: (value: string) => void;
  ariaLabel: string;
  viewportClassName?: string;
  showTextWhileScrolling?: boolean;
  alwaysShowLabel?: boolean;
  showSnapHint?: boolean;
};

function findClosestSnapIndex(emblaApi: EmblaCarouselType): number {
  const { scrollSnaps, location } = emblaApi.internalEngine();
  const current = location.get();
  let closestIndex = 0;
  let minDistance = Number.POSITIVE_INFINITY;

  scrollSnaps.forEach((snap, index) => {
    const distance = Math.abs(snap - current);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function snapOffsetPx(emblaApi: EmblaCarouselType, index: number): number {
  const { scrollSnaps, location } = emblaApi.internalEngine();
  return Math.abs((scrollSnaps[index] ?? 0) - location.get());
}

function normalizeIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

function indexForValue(items: RollingPickerItem[], target: string): number {
  const idx = items.findIndex((item) => item.value.toLowerCase() === target.toLowerCase());
  return idx >= 0 ? idx : 0;
}

/** Compact Y-axis rolling picker — one slide visible, looped, dragFree with snap-to-center. */
export function RollingPicker({
  items,
  value,
  onChange,
  onUserSelect,
  ariaLabel,
  viewportClassName = "h-7 w-7",
  showTextWhileScrolling = true,
  alwaysShowLabel = false,
  showSnapHint = true,
}: RollingPickerProps) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onUserSelectRef = useRef(onUserSelect);
  onUserSelectRef.current = onUserSelect;

  const isProgrammaticScrollRef = useRef(false);
  const itemsLengthRef = useRef(items.length);

  const [snapHint, setSnapHint] = useState("");
  const [showLabels, setShowLabels] = useState(false);
  const showLabelsRef = useRef(false);
  const snapHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDraggedRef = useRef(false);

  const setScrollingLabels = useCallback((active: boolean) => {
    showLabelsRef.current = active;
    setShowLabels(active);
    if (active && snapHintTimerRef.current) {
      clearTimeout(snapHintTimerRef.current);
      snapHintTimerRef.current = null;
      setSnapHint("");
    }
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: items.length > 1,
    align: "center",
    containScroll: false,
    dragFree: true,
    duration: 20,
  });

  const commitSelection = useCallback((embla: EmblaCarouselType) => {
    const list = itemsRef.current;
    if (list.length === 0) return;
    const index = findClosestSnapIndex(embla);
    const entry = list[normalizeIndex(index, list.length)];
    if (!entry || entry.value === valueRef.current) return;
    onChangeRef.current(entry.value);
  }, []);

  const ensureSnappedToCenter = useCallback((embla: EmblaCarouselType): boolean => {
    const closest = findClosestSnapIndex(embla);
    if (snapOffsetPx(embla, closest) > SNAP_ALIGN_THRESHOLD_PX) {
      isProgrammaticScrollRef.current = true;
      embla.scrollTo(closest);
      return true;
    }
    return false;
  }, []);

  const showSnapHintLabel = useCallback(
    (embla: EmblaCarouselType) => {
      if (!showSnapHint || showLabelsRef.current) return;
      const closest = findClosestSnapIndex(embla);
      if (snapOffsetPx(embla, closest) > SNAP_ALIGN_THRESHOLD_PX) return;

      const list = itemsRef.current;
      const entry = list[normalizeIndex(closest, list.length)];
      if (!entry) return;

      setSnapHint(entry.label);
      if (snapHintTimerRef.current) clearTimeout(snapHintTimerRef.current);
      snapHintTimerRef.current = setTimeout(() => {
        setSnapHint("");
        snapHintTimerRef.current = null;
      }, SNAP_HINT_VISIBLE_MS);
    },
    [showSnapHint],
  );

  useEffect(() => {
    return () => {
      if (snapHintTimerRef.current) clearTimeout(snapHintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      if (isProgrammaticScrollRef.current) return;
      const engine = emblaApi.internalEngine();
      if (!engine.scrollBody.settled()) return;
      commitSelection(emblaApi);
    };

    const onPointerDown = () => {
      userDraggedRef.current = true;
      if (showTextWhileScrolling) setScrollingLabels(true);
    };

    const onWheel = (event: WheelEvent) => {
      if (isProgrammaticScrollRef.current) return;
      if (itemsRef.current.length <= 1) return;
      if (Math.abs(event.deltaY) < WHEEL_DELTA_TRIGGER_PX) return;

      event.preventDefault();
      event.stopPropagation();
      userDraggedRef.current = true;
      if (showTextWhileScrolling) setScrollingLabels(true);

      const direction = event.deltaY > 0 ? 1 : -1;
      const currentIndex = findClosestSnapIndex(emblaApi);
      const nextIndex = normalizeIndex(currentIndex + direction, itemsRef.current.length);
      isProgrammaticScrollRef.current = true;
      emblaApi.scrollTo(nextIndex);
    };

    const onSettle = () => {
      isProgrammaticScrollRef.current = false;
      const stillCentering = ensureSnappedToCenter(emblaApi);
      if (stillCentering) return;

      commitSelection(emblaApi);

      if (showTextWhileScrolling) setScrollingLabels(false);
      const dragged = userDraggedRef.current;
      userDraggedRef.current = false;
      if (dragged) {
        const index = findClosestSnapIndex(emblaApi);
        const entry = itemsRef.current[normalizeIndex(index, itemsRef.current.length)];
        if (entry) {
          onUserSelectRef.current?.(entry.value);
        }
        showSnapHintLabel(emblaApi);
      }
    };

    const onScroll = () => {
      const engine = emblaApi.internalEngine();
      if (
        showTextWhileScrolling &&
        !isProgrammaticScrollRef.current &&
        !engine.scrollBody.settled()
      ) {
        setScrollingLabels(true);
      }
      if (engine.dragHandler.pointerDown()) return;
      if (!engine.scrollBody.settled()) return;
      ensureSnappedToCenter(emblaApi);
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("settle", onSettle);
    emblaApi.on("scroll", onScroll);
    emblaApi.rootNode().addEventListener("wheel", onWheel, { passive: false });

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("settle", onSettle);
      emblaApi.off("scroll", onScroll);
      emblaApi.rootNode().removeEventListener("wheel", onWheel);
    };
  }, [
    emblaApi,
    commitSelection,
    ensureSnappedToCenter,
    setScrollingLabels,
    showSnapHintLabel,
    showTextWhileScrolling,
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    if (itemsLengthRef.current === items.length) return;
    itemsLengthRef.current = items.length;
    isProgrammaticScrollRef.current = true;
    emblaApi.reInit();
    emblaApi.scrollTo(indexForValue(itemsRef.current, valueRef.current), true);
  }, [emblaApi, items.length]);

  useEffect(() => {
    if (!emblaApi || items.length === 0) return;
    const index = indexForValue(items, value);
    if (emblaApi.selectedScrollSnap() === index) return;
    isProgrammaticScrollRef.current = true;
    emblaApi.scrollTo(index, true);
  }, [emblaApi, items.length, value]);

  const activeItem = items.find((item) => item.value === value) ?? items[0];
  const useLabelSlides = alwaysShowLabel || (showTextWhileScrolling && showLabels);

  const renderSlideContent = (item: RollingPickerItem, isActive: boolean) => {
    if (useLabelSlides) {
      return (
        item.labelSlide ?? (
          <span
            className={cn(
              "block max-w-full truncate px-1 font-mono text-[8px] leading-none tracking-[0.04em]",
              isActive ? "text-[#7dffb4]" : "text-[#9eada7]",
            )}
          >
            {item.label}
          </span>
        )
      );
    }
    return item.slide;
  };

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded border border-[#2a3530] bg-[#060708] font-mono text-[8px] text-[#6f7a75]",
          viewportClassName,
        )}
      >
        …
      </div>
    );
  }

  return (
    <div className="relative flex shrink-0 flex-col items-center">
      {snapHint ? (
        <div
          className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded border border-[#2a3530] bg-[#0e1011] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#7dffb4] shadow-[var(--realmorphism-shadow-rest)]"
          role="status"
          aria-live="polite"
        >
          {snapHint}
        </div>
      ) : null}
      <div
        className="flex shrink-0 flex-col items-center rounded border border-[#2a3530] bg-[#060708]"
        aria-label={ariaLabel}
        title={activeItem?.label}
      >
        <div
          ref={emblaRef}
          className={cn(
            "cursor-default overflow-hidden touch-pan-y transition-[width] duration-150 ease-out",
            viewportClassName,
            useLabelSlides && "w-auto",
            useLabelSlides && !alwaysShowLabel && "min-w-[5.25rem] max-w-[6.75rem]",
          )}
        >
          <div className="flex h-full flex-col">
            {items.map((item) => {
              const isActive = item.value === value;
              return (
                <div
                  key={item.value}
                  className="flex min-h-0 flex-[0_0_100%] items-center justify-center px-0.5"
                >
                  <div
                    className={
                      useLabelSlides
                        ? "flex w-full min-w-0 items-center justify-center"
                        : isActive
                          ? "text-[#7dffb4]"
                          : "text-[#9eada7]"
                    }
                  >
                    {renderSlideContent(item, isActive)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
