import { describe, expect, it } from "vitest";
import type { Bounds } from "@/features/zavi-dash/domain/game";
import { boundsIntersectTriangle, sweptBoundsIntersectTriangle, type Triangle } from "./spire-collision";

const triangle: Triangle = {
  left: { x: 400, y: 430 },
  apex: { x: 440, y: 330 },
  right: { x: 480, y: 430 },
};

describe("spire collision geometry", () => {
  it("allows a near-miss inside the old rectangular bounding area but outside the visible triangle", () => {
    const nearMiss: Bounds = { x: 362, y: 340, width: 52, height: 52 };

    expect(boundsIntersectTriangle(nearMiss, triangle)).toBe(false);
    expect(sweptBoundsIntersectTriangle(nearMiss, nearMiss, triangle)).toBe(false);
  });

  it("detects contact with the visible triangular spike, including fast deterministic sweeps", () => {
    const contact: Bounds = { x: 400, y: 370, width: 52, height: 52 };
    const fastPrevious: Bounds = { x: 100, y: 378, width: 52, height: 52 };
    const fastNext: Bounds = { ...fastPrevious, x: 600 };

    expect(boundsIntersectTriangle(contact, triangle)).toBe(true);
    expect(sweptBoundsIntersectTriangle(fastPrevious, fastNext, triangle)).toBe(true);
  });
});
