/** Shared modulo wrap math for finite Embla wheels (JS loop, not native Embla loop). */

export function normalizeIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

export function nextLoopIndex(currentIndex: number, itemCount: number): number {
  return normalizeIndex(currentIndex + 1, itemCount);
}

export function prevLoopIndex(currentIndex: number, itemCount: number): number {
  return normalizeIndex(currentIndex - 1, itemCount);
}

export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

export function stepIndex(index: number, count: number, loop: boolean): number {
  return loop ? normalizeIndex(index, count) : clampIndex(index, count);
}

/** True when loop wheel wraps across catalog boundary (needs instant jump). */
export function isLoopWrapStep(from: number, to: number, count: number): boolean {
  if (count <= 1 || from === to) return false;
  return (from === 0 && to === count - 1) || (from === count - 1 && to === 0);
}

/** True when a multi-step wheel/drag crosses the catalog seam (not only adjacent wrap). */
export function needsLoopJump(from: number, to: number, direction: number, count: number): boolean {
  if (count <= 1 || from === to) return false;
  if (isLoopWrapStep(from, to, count)) return true;
  if (direction > 0 && to < from) return true;
  if (direction < 0 && to > from) return true;
  return false;
}

/** Opposite catalog end when the user scrolls past the first or last snap. */
export function loopBoundaryWrapTarget(
  currentIndex: number,
  direction: number,
  count: number,
): number | null {
  if (count <= 1 || direction === 0) return null;
  if (currentIndex === 0 && direction < 0) return count - 1;
  if (currentIndex === count - 1 && direction > 0) return 0;
  return null;
}
