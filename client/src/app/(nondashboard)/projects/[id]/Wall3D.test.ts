import { createDoorGeometry, createWindowGeometry } from "./Wall3D";
import { Wall, Door, Window } from "./types";

describe("Wall3D helper geometry", () => {
  const wall: Wall = {
    id: "w",
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    dimensions: { height: 3, depth: 0.1 },
  } as any; // only dimensions are used here
  const wallLength = 1;

  test("door geometry is positioned on floor and has correct height", () => {
    const door: Door = {
      id: "d",
      wallId: "w",
      offset: 0,
      width: 1,
      height: 2.2,
    } as any;
    const geo = createDoorGeometry(door, wall, wallLength);
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    // bottom of the cut box should sit at y=0 (floor)
    expect(bb.min.y).toBeCloseTo(0, 3);
    // top of the cut box should equal the door height (plus small epsilon)
    expect(bb.max.y).toBeCloseTo(door.height, 3);
  });

  test("window geometry respects sillHeight from floor", () => {
    const window: Window = {
      id: "w1",
      wallId: "w",
      offset: 0,
      width: 1,
      height: 1,
      sillHeight: 0.5,
    } as any;
    const geo = createWindowGeometry(window, wall, wallLength);
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    expect(bb.min.y).toBeCloseTo(window.sillHeight, 3);
    expect(bb.max.y).toBeCloseTo(window.sillHeight + window.height, 3);
  });
});
