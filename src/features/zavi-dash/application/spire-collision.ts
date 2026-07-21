import type { Bounds } from "@/features/zavi-dash/domain/game";

type Point = {
  x: number;
  y: number;
};

export type Triangle = {
  apex: Point;
  left: Point;
  right: Point;
};

function pointInsideBounds(point: Point, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

function signedArea(first: Point, second: Point, third: Point): number {
  return (first.x - third.x) * (second.y - third.y) - (second.x - third.x) * (first.y - third.y);
}

function pointInsideTriangle(point: Point, triangle: Triangle): boolean {
  const first = signedArea(point, triangle.left, triangle.apex);
  const second = signedArea(point, triangle.apex, triangle.right);
  const third = signedArea(point, triangle.right, triangle.left);
  const hasNegative = first < 0 || second < 0 || third < 0;
  const hasPositive = first > 0 || second > 0 || third > 0;

  return !hasNegative || !hasPositive;
}

function rangesOverlap(firstStart: number, firstEnd: number, secondStart: number, secondEnd: number): boolean {
  return Math.max(firstStart, secondStart) <= Math.min(firstEnd, secondEnd);
}

function segmentsIntersect(firstStart: Point, firstEnd: Point, secondStart: Point, secondEnd: Point): boolean {
  const first = signedArea(firstStart, firstEnd, secondStart);
  const second = signedArea(firstStart, firstEnd, secondEnd);
  const third = signedArea(secondStart, secondEnd, firstStart);
  const fourth = signedArea(secondStart, secondEnd, firstEnd);

  if ((first > 0 && second < 0 || first < 0 && second > 0) && (third > 0 && fourth < 0 || third < 0 && fourth > 0)) {
    return true;
  }

  if (first === 0 && rangesOverlap(firstStart.x, firstEnd.x, secondStart.x, secondEnd.x) && rangesOverlap(firstStart.y, firstEnd.y, secondStart.y, secondEnd.y)) return true;
  if (second === 0 && rangesOverlap(firstStart.x, firstEnd.x, secondStart.x, secondEnd.x) && rangesOverlap(firstStart.y, firstEnd.y, secondStart.y, secondEnd.y)) return true;
  if (third === 0 && rangesOverlap(secondStart.x, secondEnd.x, firstStart.x, firstEnd.x) && rangesOverlap(secondStart.y, secondEnd.y, firstStart.y, firstEnd.y)) return true;
  if (fourth === 0 && rangesOverlap(secondStart.x, secondEnd.x, firstStart.x, firstEnd.x) && rangesOverlap(secondStart.y, secondEnd.y, firstStart.y, firstEnd.y)) return true;

  return false;
}

export function boundsIntersectTriangle(bounds: Bounds, triangle: Triangle): boolean {
  const corners: readonly Point[] = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ];
  const rectangleEdges: readonly [Point, Point][] = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ];
  const triangleEdges: readonly [Point, Point][] = [
    [triangle.left, triangle.apex],
    [triangle.apex, triangle.right],
    [triangle.right, triangle.left],
  ];

  return (
    corners.some((corner) => pointInsideTriangle(corner, triangle)) ||
    [triangle.left, triangle.apex, triangle.right].some((point) => pointInsideBounds(point, bounds)) ||
    rectangleEdges.some(([start, end]) => triangleEdges.some(([triangleStart, triangleEnd]) =>
      segmentsIntersect(start, end, triangleStart, triangleEnd),
    ))
  );
}

function interpolateBounds(previous: Bounds, next: Bounds, progress: number): Bounds {
  return {
    x: previous.x + (next.x - previous.x) * progress,
    y: previous.y + (next.y - previous.y) * progress,
    width: previous.width,
    height: previous.height,
  };
}

export function sweptBoundsIntersectTriangle(previous: Bounds, next: Bounds, triangle: Triangle): boolean {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(next.x - previous.x), Math.abs(next.y - previous.y))));

  for (let step = 0; step <= steps; step += 1) {
    if (boundsIntersectTriangle(interpolateBounds(previous, next, step / steps), triangle)) return true;
  }

  return false;
}
