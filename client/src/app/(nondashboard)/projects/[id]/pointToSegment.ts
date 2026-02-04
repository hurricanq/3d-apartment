import { Wall } from "./types";

export function projectPointToSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLenSq = abx * abx + aby * aby;
  let t = (apx * abx + apy * aby) / abLenSq;

  // Clamp to segment
  t = Math.max(0, Math.min(1, t));

  return {
    x: a.x + abx * t,
    y: a.y + aby * t,
    t, // normalized position (0 → 1)
  };
}

export function findNearestWall(
  point: { x: number; y: number },
  walls: Wall[],
) {
  let bestWall = null;
  let bestProjection = null;
  let minDist = Infinity;

  for (const wall of walls) {
    const proj = projectPointToSegment(point, wall.start, wall.end);

    const dx = point.x - proj.x;
    const dy = point.y - proj.y;
    const dist = Math.hypot(dx, dy);

    if (dist < minDist) {
      minDist = dist;
      bestWall = wall;
      bestProjection = proj;
    }
  }

  return bestWall && bestProjection
    ? { wall: bestWall, projection: bestProjection, distance: minDist }
    : null;
}
