import { Wall } from "./types";

export function wallToMeshData(wall: Wall) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  return {
    length: Math.hypot(dx, dy),
    angle: Math.atan2(dy, dx),
    center: {
      x: (wall.start.x + wall.end.x) / 2,
      z: (wall.start.y + wall.end.y) / 2,
    },
  };
}
