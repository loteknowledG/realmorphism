import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "../../lib/utils.ts";
import {
  applyIosPickerSlideStyles,
  applyPinnedShowroomSlideStyles,
  findClosestSnapIndex,
} from "../../lib/embla-ios-picker-loop.ts";
import {
  loopBoundaryWrapTarget,
  normalizeIndex,
  stepIndex,
} from "../../lib/rolling-picker-loop.ts";
import floatWheelStyles from "./float-wheel-picker.module.css";
import type { RollingPickerItem, RollingPickerProps } from "./rolling-picker-types.ts";

export type { RollingPickerItem, RollingPickerProps } from "./rolling-picker-types.ts";
export type {
  CompactRollingPickerProps,
  ExpandRollingPickerProps,
  ShowroomRollingPickerProps,
} from "./rolling-picker-types.ts";

const SNAP_ALIGN_THRESHOLD_PX = 0.5;
const WHEEL_DELTA_TRIGGER_PX = 4;
/** Expand wheels (glyph toolbar, showroom) — overshoot + snap-back settle. */
const EXPAND_WHEEL_MOMENTUM_GAIN = 1.12;
const EXPAND_WHEEL_MOMENTUM_FRICTION = 0.93;
const EXPAND_WHEEL_MOMENTUM_DURATION = 62;
const EXPAND_DRAG_FLICK_VELOCITY_SCALE = 16;
/** Compact icon rollers (operator doc type, engine, export). */
const COMPACT_WHEEL_MOMENTUM_GAIN = 0.98;
const COMPACT_WHEEL_MOMENTUM_FRICTION = 0.9;
const COMPACT_WHEEL_MOMENTUM_DURATION = 54;
const COMPACT_DRAG_FLICK_VELOCITY_SCALE = 11;
const SNAP_HINT_VISIBLE_MS = 1400;

function snapOffsetPx(emblaApi: EmblaCarouselType, index: number): number {
  const { scrollSnaps, location } = emblaApi.internalEngine();
  return Math.abs((scrollSnaps[index] ?? 0) - location.get());
}

function wheelStepsFromDelta(deltaY: number, baseStep: number): number {
  return Math.abs(deltaY) >= WHEEL_DELTA_TRIGGER_PX ? baseStep : 0;
}

function indexForValue(items: RollingPickerItem[], target: string): number {
  const idx = items.findIndex((item) => item.value.toLowerCase() === target.toLowerCase());
  return idx >= 0 ? idx : 0;
}

export function RollingPicker({
  items,
  value,
  onChange,
  onUserSelect,
  ariaLabel,
  viewportClassName = "h-7 w-7",
  showTextWhileScrolling = true,
  alwaysShowLabel = false,
  showSnapHint = false,
  wheelExpandOnScroll = false,
  wheelPinnedOpen = false,
  wheelTransparent = false,
  wheelNeighborCount = 3,
  slideHeightPx = 28,
  wheelScrollStep = 1,
  wheelMomentum,
  wheelMomentumGain,
  wheelMomentumFriction,
  wheelMomentumDuration,
  wheelSettledShowsSlide = false,
  inlinePanelClassName,
  wheelFullWidth = false,
  loop: loopProp,
  rollerType,
}: RollingPickerProps) {
  /** All multi-item pickers loop unless explicitly disabled (JS wrap + jump scroll). */
  const loopEnabled = loopProp ?? items.length > 1;
  /** Finite Embla + JS scrollTo(jump) — native loop breaks on long lists and wrap steps on short ones. */
  const emblaLoopEngine = false;
  const inlinePanelFullWidth =
    wheelFullWidth ||
    inlinePanelClassName?.includes("w-full") ||
    viewportClassName.includes("w-full");
  const compactToolbarFill =
    inlinePanelFullWidth || viewportClassName.includes("max-w-none");
  const useWheelMomentum = wheelMomentum ?? true;
  const useExpandMomentum = wheelExpandOnScroll || wheelPinnedOpen;
  const resolvedMomentumGain =
    wheelMomentumGain ??
    (useExpandMomentum ? EXPAND_WHEEL_MOMENTUM_GAIN : COMPACT_WHEEL_MOMENTUM_GAIN);
  const resolvedMomentumFriction =
    wheelMomentumFriction ??
    (useExpandMomentum ? EXPAND_WHEEL_MOMENTUM_FRICTION : COMPACT_WHEEL_MOMENTUM_FRICTION);
  const resolvedMomentumDuration =
    wheelMomentumDuration ??
    (useExpandMomentum ? EXPAND_WHEEL_MOMENTUM_DURATION : COMPACT_WHEEL_MOMENTUM_DURATION);
  const resolvedDragFlickScale = useExpandMomentum
    ? EXPAND_DRAG_FLICK_VELOCITY_SCALE
    : COMPACT_DRAG_FLICK_VELOCITY_SCALE;
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
  const wheelInitDoneRef = useRef(false);
  const neighborsVisibleRef = useRef(false);
  const [showLabels, setShowLabels] = useState(false);
  const showLabelsRef = useRef(false);
  const [snapHint, setSnapHint] = useState("");
  const snapHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wheelSettled, setWheelSettled] = useState(true);
  const [centerIndex, setCenterIndex] = useState(() => indexForValue(items, value));

  const userDraggedRef = useRef(false);
  const userWheelPendingRef = useRef(false);
  const interactionDirectionRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const handleWheelRef = useRef<(event: WheelEvent) => void>(() => {});
  const pickerHostRef = useRef<HTMLDivElement>(null);
  const wheelNotifyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setScrollingLabels = useCallback((active: boolean) => {
    showLabelsRef.current = active;
    setShowLabels(active);
    if (active && snapHintTimerRef.current) {
      clearTimeout(snapHintTimerRef.current);
      snapHintTimerRef.current = null;
      setSnapHint("");
    }
  }, []);

  const showSnapHintLabel = useCallback(
    (embla: EmblaCarouselType) => {
      if (!showSnapHint || showLabelsRef.current || wheelExpandOnScroll) return;
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
    [showSnapHint, wheelExpandOnScroll],
  );

  const maxNeighborSteps = Math.max(0, Math.floor((wheelNeighborCount - 1) / 2));
  const expandedWheelHeightPx = slideHeightPx * wheelNeighborCount;
  const inlineExpandToolbar = wheelExpandOnScroll && !wheelPinnedOpen;
  const inlineExpandSpinning = inlineExpandToolbar && !wheelSettled;
  const emblaAlign = (wheelExpandOnScroll ? "center" : "start") as "center" | "start";
  const wheelStageHeightPx = wheelPinnedOpen
    ? expandedWheelHeightPx
    : inlineExpandToolbar && wheelSettled
      ? slideHeightPx
      : expandedWheelHeightPx;

  const iosPickerStyleOptions = useMemo(
    () => ({
      compact: true,
      rolodex: false,
      itemSizePx: slideHeightPx,
      maxNeighborSteps,
      centerEmphasis: wheelPinnedOpen,
    }),
    [slideHeightPx, maxNeighborSteps, wheelPinnedOpen],
  );

  /** Compact / inline expand toolbar — clear Embla-applied opacity so center title stays visible. */
  const resetCompactSlideStyles = useCallback((embla: EmblaCarouselType) => {
    embla.slideNodes().forEach((node) => {
      node.style.opacity = "";
      node.style.pointerEvents = "";
      node.style.transform = "";
      const inner = node.querySelector<HTMLElement>("[data-ios-picker-inner]");
      if (inner) {
        inner.style.opacity = "";
        inner.style.pointerEvents = "";
        inner.style.transform = "";
      }
    });
  }, []);

  const hideNeighborPreviews = useCallback(
    (embla: EmblaCarouselType) => {
      neighborsVisibleRef.current = false;
      setWheelSettled(true);
      const center = findClosestSnapIndex(embla);
      setCenterIndex(center);
      // Inline expand toolbar: clip to one row — do not zero opacity (breaks long catalogs).
      if (wheelExpandOnScrollRef.current && !wheelPinnedOpenRef.current) {
        resetCompactSlideStyles(embla);
        return;
      }
      applyIosPickerSlideStyles(embla, "settle", {
        ...iosPickerStyleOptions,
        maxNeighborSteps: 0,
      });
    },
    [iosPickerStyleOptions, resetCompactSlideStyles],
  );

  const showNeighborPreviews = useCallback(
    (embla: EmblaCarouselType, eventName?: string) => {
      neighborsVisibleRef.current = true;
      setWheelSettled(false);
      const center = findClosestSnapIndex(embla);
      setCenterIndex(center);
      if (wheelPinnedOpen) {
        applyPinnedShowroomSlideStyles(embla, center, iosPickerStyleOptions);
        return;
      }
      applyIosPickerSlideStyles(embla, eventName, iosPickerStyleOptions);
    },
    [iosPickerStyleOptions, wheelPinnedOpen],
  );

  const showCompactSlidesDuringScroll = useCallback(
    (embla: EmblaCarouselType) => {
      resetCompactSlideStyles(embla);
    },
    [resetCompactSlideStyles],
  );

  const applyPinnedWheelAtRest = useCallback(
    (embla: EmblaCarouselType) => {
      neighborsVisibleRef.current = true;
      setWheelSettled(true);
      const center = findClosestSnapIndex(embla);
      setCenterIndex(center);
      applyPinnedShowroomSlideStyles(embla, center, iosPickerStyleOptions);
    },
    [iosPickerStyleOptions],
  );

  const settleWheelNeighbors = useCallback(
    (embla: EmblaCarouselType, eventName?: string) => {
      if (wheelPinnedOpen) {
        applyPinnedWheelAtRest(embla);
      } else {
        hideNeighborPreviews(embla);
      }
    },
    [wheelPinnedOpen, applyPinnedWheelAtRest, hideNeighborPreviews],
  );

  const endProgrammaticScroll = useCallback((embla: EmblaCarouselType) => {
    isProgrammaticScrollRef.current = false;
  }, []);

  const wheelScrollStepRef = useRef(wheelScrollStep);
  wheelScrollStepRef.current = wheelScrollStep;
  const useWheelMomentumRef = useRef(useWheelMomentum);
  useWheelMomentumRef.current = useWheelMomentum;
  const momentumGainRef = useRef(resolvedMomentumGain);
  momentumGainRef.current = resolvedMomentumGain;
  const momentumFrictionRef = useRef(resolvedMomentumFriction);
  momentumFrictionRef.current = resolvedMomentumFriction;
  const momentumDurationRef = useRef(resolvedMomentumDuration);
  momentumDurationRef.current = resolvedMomentumDuration;
  const wheelPinnedOpenRef = useRef(wheelPinnedOpen);
  wheelPinnedOpenRef.current = wheelPinnedOpen;
  const wheelExpandOnScrollRef = useRef(wheelExpandOnScroll);
  wheelExpandOnScrollRef.current = wheelExpandOnScroll;
  const loopEnabledRef = useRef(loopEnabled);
  loopEnabledRef.current = loopEnabled;
  const dragFlickScaleRef = useRef(resolvedDragFlickScale);
  dragFlickScaleRef.current = resolvedDragFlickScale;

  const applyWheelMomentum = useCallback((embla: EmblaCarouselType, deltaY: number) => {
    const engine = embla.internalEngine();
    engine.scrollBody
      .useFriction(momentumFrictionRef.current)
      .useDuration(momentumDurationRef.current);
    engine.animation.start();
    engine.scrollTo.distance(deltaY * momentumGainRef.current, false);
  }, []);

  const boostDragFlick = useCallback((embla: EmblaCarouselType) => {
    if (!useWheelMomentumRef.current) return;
    const engine = embla.internalEngine();
    const velocity = engine.scrollBody.velocity();
    if (Math.abs(velocity) < 0.04) return;
    engine.scrollBody
      .useFriction(momentumFrictionRef.current)
      .useDuration(momentumDurationRef.current);
    engine.animation.start();
    engine.scrollTo.distance(velocity * dragFlickScaleRef.current, false);
  }, []);

  const emblaWheelOptions = useMemo(
    () => ({
      loop: emblaLoopEngine,
      align: emblaAlign,
      containScroll: (emblaLoopEngine || loopEnabled ? false : "trimSnaps") as false | "trimSnaps",
      dragFree: !loopEnabled,
    }),
    [emblaAlign, loopEnabled, emblaLoopEngine],
  );

  const reInitWheel = useCallback(
    (embla: EmblaCarouselType) => {
      embla.reInit(emblaWheelOptions);
    },
    [emblaWheelOptions],
  );

  const reInitWheelRef = useRef(reInitWheel);
  reInitWheelRef.current = reInitWheel;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: emblaLoopEngine,
    align: emblaAlign,
    containScroll: emblaLoopEngine || loopEnabled ? (false as const) : ("trimSnaps" as const),
    dragFree: !loopEnabled,
    watchDrag: true,
    duration: wheelExpandOnScroll ? 28 : 22,
  });

  useEffect(() => {
    if (!emblaApi) return;
    reInitWheel(emblaApi);
  }, [emblaApi, reInitWheel, items.length]);

  const resolvedSnapIndex = useCallback((embla: EmblaCarouselType) => {
    if (loopEnabledRef.current) return embla.selectedScrollSnap();
    return findClosestSnapIndex(embla);
  }, []);

  const notifyUserSettled = useCallback((embla: EmblaCarouselType) => {
    const list = itemsRef.current;
    if (list.length === 0) return;
    const index = resolvedSnapIndex(embla);
    const entry = list[normalizeIndex(index, list.length)];
    if (!entry) return;
    if (entry.value !== valueRef.current) {
      onChangeRef.current(entry.value);
    }
    onUserSelectRef.current?.(entry.value);
    setCenterIndex(normalizeIndex(index, list.length));
    userDraggedRef.current = false;
    userWheelPendingRef.current = false;
    interactionDirectionRef.current = 0;
  }, [resolvedSnapIndex]);

  const commitSelection = useCallback((embla: EmblaCarouselType) => {
    const list = itemsRef.current;
    if (list.length === 0) return;
    const index = resolvedSnapIndex(embla);
    const entry = list[normalizeIndex(index, list.length)];
    if (!entry) return;
    const userActed = userDraggedRef.current || userWheelPendingRef.current;
    if (entry.value !== valueRef.current) {
      onChangeRef.current(entry.value);
    }
    setCenterIndex(normalizeIndex(index, list.length));
    if (!userActed) return;
    onUserSelectRef.current?.(entry.value);
    userDraggedRef.current = false;
    userWheelPendingRef.current = false;
    interactionDirectionRef.current = 0;
  }, [resolvedSnapIndex]);

  /** Expand-inline: write ascii / fire onUserSelect once wheel motion stops. */
  const maybeNotifyUserSettled = useCallback(
    (embla: EmblaCarouselType) => {
      if (!userDraggedRef.current && !userWheelPendingRef.current) return;
      notifyUserSettled(embla);
    },
    [notifyUserSettled],
  );

  /** Loop wheel: instant jump only when wrapping catalog ends; otherwise animate/momentum. */
  const finishLoopWheelStep = useCallback(
    (embla: EmblaCarouselType, nextIndex: number) => {
      endProgrammaticScroll(embla);
      const count = itemsRef.current.length;
      if (count <= 0) return;
      const normalized = normalizeIndex(nextIndex, count);
      const entry = itemsRef.current[normalized];
      if (entry && entry.value !== valueRef.current) {
        onChangeRef.current(entry.value);
      }
      if ((userDraggedRef.current || userWheelPendingRef.current) && entry) {
        onUserSelectRef.current?.(entry.value);
      }
      setCenterIndex(normalized);
      if (wheelExpandOnScrollRef.current) {
        settleWheelNeighbors(embla, "settle");
      } else {
        resetCompactSlideStyles(embla);
      }
      userDraggedRef.current = false;
      userWheelPendingRef.current = false;
    },
    [endProgrammaticScroll, settleWheelNeighbors, resetCompactSlideStyles],
  );

  const tryLoopDragWrap = useCallback(
    (embla: EmblaCarouselType): boolean => {
      if (!loopEnabledRef.current) return false;
      const count = itemsRef.current.length;
      if (count <= 1) return false;

      const idx = embla.selectedScrollSnap();
      const dir = interactionDirectionRef.current;
      const wrapTo = loopBoundaryWrapTarget(idx, dir, count);
      if (wrapTo == null) return false;

      isProgrammaticScrollRef.current = true;
      embla.scrollTo(wrapTo, true);
      finishLoopWheelStep(embla, wrapTo);
      interactionDirectionRef.current = 0;
      return true;
    },
    [finishLoopWheelStep],
  );

  const ensureSnappedToCenter = useCallback((embla: EmblaCarouselType): boolean => {
    const closest = findClosestSnapIndex(embla);
    if (snapOffsetPx(embla, closest) > SNAP_ALIGN_THRESHOLD_PX) {
      isProgrammaticScrollRef.current = true;
      embla.scrollTo(closest);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    return () => {
      if (snapHintTimerRef.current) clearTimeout(snapHintTimerRef.current);
      if (wheelNotifyDebounceRef.current) clearTimeout(wheelNotifyDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi || !inlineExpandToolbar) return;
    if (wheelSettled) {
      hideNeighborPreviews(emblaApi);
    }
  }, [emblaApi, inlineExpandToolbar, wheelSettled, hideNeighborPreviews]);

  const mountShowroomWheel = useCallback(
    (embla: EmblaCarouselType) => {
      const panel = pickerHostRef.current?.querySelector<HTMLElement>("[data-float-wheel-panel]");
      const hostHeight = wheelPinnedOpenRef.current
        ? (panel?.clientHeight ?? 0)
        : (embla.rootNode()?.clientHeight ?? 0);
      if (hostHeight < 4) return false;

      const index = indexForValue(itemsRef.current, valueRef.current);
      reInitWheelRef.current(embla);
      isProgrammaticScrollRef.current = true;
      embla.scrollTo(index, true);
      requestAnimationFrame(() => {
        endProgrammaticScroll(embla);
        settleWheelNeighbors(embla, "reInit");
      });
      return true;
    },
    [endProgrammaticScroll, settleWheelNeighbors],
  );

  useEffect(() => {
    if (!emblaApi || !wheelExpandOnScroll || items.length === 0) return;

    const initWheel = () => {
      const root = emblaApi.rootNode();
      if (!root) return false;
      return mountShowroomWheel(emblaApi);
    };

    if (!wheelInitDoneRef.current) {
      if (initWheel()) wheelInitDoneRef.current = true;
    } else {
      settleWheelNeighbors(emblaApi, "reInit");
    }

    const root = emblaApi.rootNode();
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        if (!initWheel()) return;
        wheelInitDoneRef.current = true;
      },
      { threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [emblaApi, wheelExpandOnScroll, items.length, mountShowroomWheel]);

  useLayoutEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      if (isProgrammaticScrollRef.current) return;
      const engine = emblaApi.internalEngine();
      if (!engine.scrollBody.settled()) return;
      commitSelection(emblaApi);
    };

    const onEmblaPointerDown = () => {
      userDraggedRef.current = true;
      if (wheelExpandOnScroll) {
        showNeighborPreviews(emblaApi, "scroll");
      } else {
        showCompactSlidesDuringScroll(emblaApi);
        if (showTextWhileScrolling) {
          setScrollingLabels(true);
        }
      }
    };

    const onNativePointerDown = (event: PointerEvent) => {
      userDraggedRef.current = true;
      interactionDirectionRef.current = 0;
      pointerStartYRef.current = event.clientY;
    };

    const onNativePointerUp = (event: PointerEvent) => {
      if (!loopEnabledRef.current) {
        if (useWheelMomentumRef.current) {
          requestAnimationFrame(() => boostDragFlick(emblaApi));
        }
        return;
      }

      const dragDeltaY = event.clientY - pointerStartYRef.current;
      if (Math.abs(dragDeltaY) < 10) return;

      const dir = dragDeltaY > 0 ? 1 : -1;
      const count = itemsRef.current.length;
      if (count <= 1) return;

      const idx = findClosestSnapIndex(emblaApi);
      const atBoundary =
        (idx === 0 && dir < 0) || (idx === count - 1 && dir > 0);
      if (!atBoundary) return;

      interactionDirectionRef.current = dir;
      const attemptWrap = () => {
        if (!emblaApi.internalEngine().scrollBody.settled()) return;
        tryLoopDragWrap(emblaApi);
      };
      requestAnimationFrame(attemptWrap);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented) return;
      if (itemsRef.current.length <= 1) return;
      if (Math.abs(event.deltaY) < WHEEL_DELTA_TRIGGER_PX) return;

      event.preventDefault();
      event.stopPropagation();
      userDraggedRef.current = true;
      userWheelPendingRef.current = true;
      if (wheelNotifyDebounceRef.current) {
        clearTimeout(wheelNotifyDebounceRef.current);
        wheelNotifyDebounceRef.current = null;
      }

      if (wheelExpandOnScroll) {
        showNeighborPreviews(emblaApi, "scroll");
      } else {
        showCompactSlidesDuringScroll(emblaApi);
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      interactionDirectionRef.current = direction;
      const steps = wheelStepsFromDelta(event.deltaY, wheelScrollStepRef.current);

      if (loopEnabledRef.current) {
        const count = itemsRef.current.length;
        const currentIndex = emblaApi.selectedScrollSnap();
        const nextIndex = normalizeIndex(currentIndex + direction * steps, count);
        if (nextIndex === currentIndex) return;

        // Looping wheels are discrete controls. Keep the visual snap and the
        // controlled value in one synchronous step so modulo wraps cannot drift.
        isProgrammaticScrollRef.current = true;
        emblaApi.scrollTo(nextIndex, true);
        finishLoopWheelStep(emblaApi, nextIndex);
        return;
      }

      const currentIndex = findClosestSnapIndex(emblaApi);
      const nextIndex = stepIndex(
        currentIndex + direction * steps,
        itemsRef.current.length,
        false,
      );

      if (useWheelMomentumRef.current) {
        applyWheelMomentum(emblaApi, event.deltaY);
        return;
      }

      isProgrammaticScrollRef.current = true;
      emblaApi.scrollTo(nextIndex);
    };

    handleWheelRef.current = onWheel;

    let rafId = 0;

    const bindInteraction = () => {
      const nodes = new Set<HTMLElement>();
      if (pickerHostRef.current) nodes.add(pickerHostRef.current);
      const root = emblaApi.rootNode();
      if (root instanceof HTMLElement) nodes.add(root);
      if (nodes.size === 0) return false;
      nodes.forEach((node) => {
        node.addEventListener("wheel", onWheel, { passive: false, capture: true });
        node.addEventListener("pointerdown", onNativePointerDown, { passive: true, capture: true });
        node.addEventListener("pointerup", onNativePointerUp, { passive: true, capture: true });
      });
      return true;
    };

    if (!bindInteraction()) {
      rafId = requestAnimationFrame(() => {
        bindInteraction();
      });
    }

    const onSettle = () => {
      endProgrammaticScroll(emblaApi);

      if (!wheelExpandOnScrollRef.current) {
        const stillCentering = ensureSnappedToCenter(emblaApi);
        if (stillCentering) return;
      }

      const dragged = userDraggedRef.current || userWheelPendingRef.current;
      const momentumSpin = dragged && useWheelMomentumRef.current;

      if (!momentumSpin) {
        commitSelection(emblaApi);
        if (dragged && loopEnabledRef.current) {
          tryLoopDragWrap(emblaApi);
        }
      }

      if (wheelExpandOnScroll) {
        settleWheelNeighbors(emblaApi, "settle");
      } else {
        setScrollingLabels(false);
        resetCompactSlideStyles(emblaApi);
      }

      if (dragged && !useWheelMomentumRef.current) {
        maybeNotifyUserSettled(emblaApi);
        showSnapHintLabel(emblaApi);
      }
    };

    const onScroll = () => {
      const engine = emblaApi.internalEngine();
      if (engine.dragHandler.pointerDown()) {
        const closest = findClosestSnapIndex(emblaApi);
        const prev = emblaApi.selectedScrollSnap();
        if (closest > prev) interactionDirectionRef.current = 1;
        else if (closest < prev) interactionDirectionRef.current = -1;
      }
      if (wheelExpandOnScroll && !engine.scrollBody.settled()) {
        showNeighborPreviews(emblaApi, "scroll");
      } else if (!wheelExpandOnScroll && !engine.scrollBody.settled()) {
        showCompactSlidesDuringScroll(emblaApi);
      }
      if (
        useWheelMomentumRef.current &&
        (userWheelPendingRef.current || userDraggedRef.current)
      ) {
        if (wheelNotifyDebounceRef.current) clearTimeout(wheelNotifyDebounceRef.current);
        wheelNotifyDebounceRef.current = setTimeout(() => {
          wheelNotifyDebounceRef.current = null;
          if (!userDraggedRef.current && !userWheelPendingRef.current) return;
          if (!emblaApi.internalEngine().scrollBody.settled()) return;
          if (loopEnabledRef.current && tryLoopDragWrap(emblaApi)) return;
          commitSelection(emblaApi);
          showSnapHintLabel(emblaApi);
        }, momentumDurationRef.current + 72);
      }
      if (engine.dragHandler.pointerDown()) return;
      if (!engine.scrollBody.settled()) return;
      if (useWheelMomentumRef.current && wheelExpandOnScroll) {
        showNeighborPreviews(emblaApi, "scroll");
      }
      if (useWheelMomentumRef.current && !loopEnabledRef.current) {
        ensureSnappedToCenter(emblaApi);
      }
    };

    const onPointerUp = () => {
      if (!useWheelMomentumRef.current || loopEnabledRef.current) return;
      requestAnimationFrame(() => boostDragFlick(emblaApi));
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", onEmblaPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    emblaApi.on("settle", onSettle);
    emblaApi.on("scroll", onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", onEmblaPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      emblaApi.off("settle", onSettle);
      emblaApi.off("scroll", onScroll);
      const unbindNodes = new Set<HTMLElement>();
      if (pickerHostRef.current) unbindNodes.add(pickerHostRef.current);
      const root = emblaApi.rootNode();
      if (root instanceof HTMLElement) unbindNodes.add(root);
      unbindNodes.forEach((node) => {
        node.removeEventListener("wheel", onWheel, { capture: true });
        node.removeEventListener("pointerdown", onNativePointerDown, { capture: true });
        node.removeEventListener("pointerup", onNativePointerUp, { capture: true });
      });
      handleWheelRef.current = () => {};
    };
  }, [
    emblaApi,
    applyWheelMomentum,
    commitSelection,
    maybeNotifyUserSettled,
    notifyUserSettled,
    tryLoopDragWrap,
    finishLoopWheelStep,
    endProgrammaticScroll,
    ensureSnappedToCenter,
    boostDragFlick,
    settleWheelNeighbors,
    showNeighborPreviews,
    showTextWhileScrolling,
    wheelExpandOnScroll,
    setScrollingLabels,
    showCompactSlidesDuringScroll,
    resetCompactSlideStyles,
    showSnapHintLabel,
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    if (itemsLengthRef.current === items.length) return;
    itemsLengthRef.current = items.length;
    isProgrammaticScrollRef.current = true;
    reInitWheelRef.current(emblaApi);
    emblaApi.scrollTo(indexForValue(itemsRef.current, valueRef.current), true);
    const onDone = () => {
      endProgrammaticScroll(emblaApi);
      if (wheelExpandOnScroll) settleWheelNeighbors(emblaApi, "reInit");
      emblaApi.off("settle", onDone);
    };
    emblaApi.on("settle", onDone);
  }, [emblaApi, items.length, wheelExpandOnScroll, settleWheelNeighbors, endProgrammaticScroll]);

  useEffect(() => {
    if (!emblaApi || items.length === 0 || wheelExpandOnScroll) return;
    const index = indexForValue(items, value);
    if (emblaApi.selectedScrollSnap() === index) return;
    isProgrammaticScrollRef.current = true;
    emblaApi.scrollTo(index, true);
  }, [emblaApi, items.length, value, wheelExpandOnScroll]);

  useEffect(() => {
    if (!emblaApi || !wheelExpandOnScroll || items.length === 0) return;
    if (neighborsVisibleRef.current && !wheelPinnedOpen) return;
    const index = indexForValue(items, value);
    if (findClosestSnapIndex(emblaApi) === index) return;
    isProgrammaticScrollRef.current = true;
    emblaApi.scrollTo(index, true);
    const onDone = () => {
      endProgrammaticScroll(emblaApi);
      settleWheelNeighbors(emblaApi, "settle");
      emblaApi.off("settle", onDone);
    };
    emblaApi.on("settle", onDone);
  }, [
    emblaApi,
    items.length,
    value,
    wheelExpandOnScroll,
    wheelPinnedOpen,
    settleWheelNeighbors,
    endProgrammaticScroll,
  ]);

  const useLabelSlides = wheelSettledShowsSlide
    ? !wheelSettled
    : alwaysShowLabel ||
      (showTextWhileScrolling && showLabels) ||
      inlineExpandSpinning;
  const renderLabelSlide = (item: RollingPickerItem, isActive: boolean) => {
    if (item.renderLabelSlide) return item.renderLabelSlide(isActive);
    if (item.labelSlide) return item.labelSlide;
    return (
      <span
        className={cn(
          "block max-w-full truncate px-1 font-mono text-[8px] leading-none tracking-[0.04em]",
          isActive ? "text-emerald-200" : "text-[#b8c4be]",
          wheelTransparent &&
            "drop-shadow-[0_0_4px_rgba(0,0,0,1)] drop-shadow-[0_1px_2px_rgba(0,0,0,1)]",
        )}
      >
        {item.label}
      </span>
    );
  };

  const renderSlideContent = (item: RollingPickerItem, isActive: boolean) => {
    if (item.renderSlide) {
      // Pinned showroom: selection band = sample + name; off-band rows = name only (no snap swap).
      if (wheelPinnedOpen && item.renderLabelSlide) {
        if (isActive) {
          return item.renderSlide(isActive);
        }
        return item.renderLabelSlide(false);
      }
      return item.renderSlide(isActive);
    }
    if (
      wheelSettledShowsSlide &&
      wheelExpandOnScroll &&
      (wheelSettled || wheelPinnedOpen) &&
      isActive
    ) {
      return item.slide ?? renderLabelSlide(item, true);
    }
    if (wheelSettledShowsSlide && wheelPinnedOpen && wheelSettled && !isActive) {
      return item.labelSlide ?? renderLabelSlide(item, false);
    }
    if (useLabelSlides) {
      return renderLabelSlide(item, isActive);
    }
    return item.slide;
  };

  const renderOptionSlide = (item: RollingPickerItem, index: number, isActive: boolean) => (
    <div
      key={item.value}
      data-testid="realm-roller-picker-option"
      data-selected={isActive ? "true" : "false"}
      data-option-value={item.value}
      className="flex min-h-0 shrink-0 items-center justify-center px-0.5"
      style={{ flex: `0 0 ${slideHeightPx}px`, height: slideHeightPx }}
    >
      <div
        className={
          !wheelExpandOnScroll && useLabelSlides
            ? "flex w-full min-w-0 items-center justify-center"
            : !wheelExpandOnScroll
              ? isActive
                ? "text-emerald-200"
                : "text-[#8a8a8a]"
              : undefined
        }
      >
        <div
          data-ios-picker-inner
          className="flex w-full min-w-0 items-center justify-center will-change-[transform,opacity]"
        >
          {renderSlideContent(item, isActive)}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (userDraggedRef.current || userWheelPendingRef.current) return;
    setCenterIndex(indexForValue(items, value));
  }, [items, value]);

  if (items.length === 0) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded border border-[#2d2d2d] bg-black font-mono text-[8px] text-[#6a6a6a] ${viewportClassName}`}
      >
        …
      </div>
    );
  }

  const showroomPanelStyle = wheelPinnedOpen
    ? ({
        ["--float-wheel-row-px" as string]: `${slideHeightPx}px`,
        ["--float-wheel-visible-rows" as string]: `${wheelNeighborCount}`,
        ["--showroom-wheel-band" as string]: `${expandedWheelHeightPx}px`,
        height: expandedWheelHeightPx,
        width: `max(${expandedWheelHeightPx}px, 9.75rem)`,
        maxWidth: "10.5rem",
        overflow: "hidden",
      } as CSSProperties)
    : ({
        ["--float-wheel-row-px" as string]: `${slideHeightPx}px`,
      } as CSSProperties);

  const viewport = wheelExpandOnScroll ? (
    <div
      data-float-wheel-panel
      data-float-wheel-showroom={wheelPinnedOpen ? "" : undefined}
      className={cn(
        floatWheelStyles.panel,
        wheelPinnedOpen ? floatWheelStyles.showroomPinned : floatWheelStyles.inline,
        wheelFullWidth && !wheelPinnedOpen && floatWheelStyles.inlineFullWidth,
        inlineExpandSpinning && floatWheelStyles.inlineSpinning,
        wheelSettled && !wheelPinnedOpen && floatWheelStyles.inlineSettled,
        wheelPinnedOpen && floatWheelStyles.spinningHost,
        wheelTransparent && floatWheelStyles.panelTransparent,
        !wheelPinnedOpen &&
          !wheelFullWidth &&
          (inlinePanelClassName ?? "min-w-[5.25rem] max-w-[10rem] shrink-0 touch-pan-y"),
        !wheelPinnedOpen && wheelFullWidth && "touch-pan-y",
      )}
      style={showroomPanelStyle}
      aria-label={ariaLabel}
    >
      <div
        data-float-wheel-stage={wheelPinnedOpen ? "" : undefined}
        className={cn(
          floatWheelStyles.wheelStage,
          inlineExpandSpinning && floatWheelStyles.spinning,
          wheelTransparent && floatWheelStyles.wheelStageTransparent,
        )}
        style={{ height: wheelPinnedOpen ? "100%" : wheelStageHeightPx }}
      >
        <div ref={emblaRef} className={floatWheelStyles.viewport}>
          <div className="flex h-full flex-col">
            {items.map((item, index) =>
              renderOptionSlide(item, index, index === centerIndex),
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div
      ref={emblaRef}
      aria-label={ariaLabel}
      className={cn(
        "cursor-default overflow-hidden touch-pan-y transition-[width] duration-150 ease-out",
        viewportClassName,
        useLabelSlides && !compactToolbarFill && "w-auto",
        useLabelSlides &&
          !alwaysShowLabel &&
          !compactToolbarFill &&
          "min-w-[5.25rem] max-w-[6.75rem]",
      )}
    >
      <div className="flex h-full flex-col">
        {items.map((item, index) =>
          renderOptionSlide(item, index, index === centerIndex),
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={pickerHostRef}
      data-testid="realm-roller-picker"
      data-roller-type={rollerType}
      data-rolling-picker-mode={
        wheelPinnedOpen ? "showroom" : wheelExpandOnScroll ? "expand" : "compact"
      }
      data-rolling-picker-loop={loopEnabled ? "true" : "false"}
      className={cn(
        "flex flex-col items-stretch",
        inlinePanelFullWidth ? "h-full min-w-0 w-full flex-1 basis-0" : "shrink-0",
        wheelExpandOnScroll && "overscroll-contain",
        inlineExpandSpinning && "overflow-visible",
        inlineExpandToolbar && wheelSettled && "overflow-hidden",
        wheelPinnedOpen && "overflow-visible",
        !wheelExpandOnScroll && !inlinePanelFullWidth && "h-7 max-h-7 overflow-hidden rounded border border-[#2d2d2d] bg-black",
        !wheelExpandOnScroll && showSnapHint && "relative",
      )}
    >
      {!wheelExpandOnScroll && showSnapHint && snapHint ? (
        <div
          className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded border border-[#2a3530] bg-[#0e1011] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#7dffb4]"
          role="status"
          aria-live="polite"
        >
          {snapHint}
        </div>
      ) : null}
      {viewport}
    </div>
  );
}
