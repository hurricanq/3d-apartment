import * as THREE from "three";
import { Wall, Window, Door } from "./types";

export function createWindowGeometry(
  window: Window,
  wall: Wall,
  wallLength: number,
): THREE.BufferGeometry {
  const { offset, width, height, sillHeight } = window;

  // x calc is unaffected by vertical alignment
  const windowCenterX = offset + width / 2 - wallLength / 2;
  // y coordinates are now measured from the floor (y=0) because we translated
  // the wall geometry upward earlier.
  const windowCenterY = sillHeight + height / 2;

  const cutDepth = wall.dimensions.depth + 0.02;
  const cutHeight = height + 0.02;
  const cutWidth = width + 0.02;

  const geometry = new THREE.BoxGeometry(cutWidth, cutHeight, cutDepth);
  geometry.translate(windowCenterX, windowCenterY, 0);

  return geometry;
}

// Helper function to create door cutout geometry
export function createDoorGeometry(
  door: Door,
  wall: Wall,
  wallLength: number,
): THREE.BufferGeometry {
  const { offset, width, height } = door;

  const doorCenterX = offset + width / 2 - wallLength / 2;
  // doorCenterY is measured from the floor (y=0).  since the wall is now
  // bottom‑aligned, we can just use half the door height here.
  const doorCenterY = height / 2;

  const cutDepth = wall.dimensions.depth + 0.02;
  const cutHeight = height + 0.02;
  const cutWidth = width + 0.02;

  const geometry = new THREE.BoxGeometry(cutWidth, cutHeight, cutDepth);
  geometry.translate(doorCenterX, doorCenterY, 0);

  return geometry;
}
