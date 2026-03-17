import { Wall, Point, Room, Node, Edge } from "./types";

const EPS = 1e-4;

// Helpers
function key(p: Point) {
  return `${p.x.toFixed(4)},${p.y.toFixed(4)}`;
}

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Project point onto segment
function projectPointToSegment(p: Point, a: Point, b: Point) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;

  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const ab2 = abx * abx + aby * aby;
  const t = (apx * abx + apy * aby) / ab2;

  const clampedT = Math.max(0, Math.min(1, t));

  return {
    point: {
      x: a.x + abx * clampedT,
      y: a.y + aby * clampedT,
    },
    t: clampedT,
    distance: dist(p, {
      x: a.x + abx * clampedT,
      y: a.y + aby * clampedT,
    }),
  };
}

// Split walls at T-junctions
function splitWalls(walls: Wall[]): Wall[] {
  let result = [...walls];

  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length; j++) {
      if (i === j) continue;

      const w1 = result[i];
      const w2 = result[j];

      // Check both endpoints of w2 against w1
      for (const p of [w2.start, w2.end]) {
        const proj = projectPointToSegment(p, w1.start, w1.end);

        if (proj.distance < EPS && proj.t > EPS && proj.t < 1 - EPS) {
          // Split w1 into two
          const newWalls: Wall[] = [
            { ...w1, end: proj.point },
            { ...w1, start: proj.point },
          ];

          // Replace w1
          result.splice(i, 1, ...newWalls);

          // Restart process
          return splitWalls(result);
        }
      }
    }
  }

  return result;
}

// Build graph
function buildGraph(walls: Wall[]) {
  const nodes = new Map<string, Node>();
  const adj = new Map<string, Edge[]>();

  for (const w of walls) {
    const a = key(w.start);
    const b = key(w.end);

    nodes.set(a, { id: a, point: w.start });
    nodes.set(b, { id: b, point: w.end });

    const ab = Math.atan2(w.end.y - w.start.y, w.end.x - w.start.x);
    const ba = Math.atan2(w.start.y - w.end.y, w.start.x - w.end.x);

    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);

    adj.get(a)!.push({ start: a, end: b, angle: ab });
    adj.get(b)!.push({ start: b, end: a, angle: ba });
  }

  // Sort edges CCW
  for (const list of adj.values()) {
    list.sort((a, b) => a.angle - b.angle);
  }

  return { nodes, adj };
}

// Geometry
function signedArea(poly: Point[]) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    a += poly[i].x * poly[j].y - poly[j].x * poly[i].y;
  }
  return a / 2;
}

function centroid(poly: Point[]): Point {
  let cx = 0,
    cy = 0,
    A = 0;

  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    const cross = poly[i].x * poly[j].y - poly[j].x * poly[i].y;

    cx += (poly[i].x + poly[j].x) * cross;
    cy += (poly[i].y + poly[j].y) * cross;
    A += cross;
  }

  A *= 0.5;
  return { x: cx / (6 * A), y: cy / (6 * A) };
}

// Room detection (face walking)
export function detectRooms(walls: Wall[]): Room[] {
  const processedWalls = splitWalls(walls);

  const { nodes, adj } = buildGraph(processedWalls);

  const visited = new Set<string>();
  const faces: Point[][] = [];

  const edgeKey = (a: string, b: string) => `${a}->${b}`;

  for (const edges of adj.values()) {
    for (const e of edges) {
      if (visited.has(edgeKey(e.start, e.end))) continue;

      const poly: Point[] = [];
      let current = e;

      while (true) {
        visited.add(edgeKey(current.start, current.end));

        const node = nodes.get(current.start);
        if (!node) break;

        poly.push(node.point);

        const nextEdges = adj.get(current.end);
        if (!nextEdges) break;

        const incoming = Math.atan2(
          nodes.get(current.start)!.point.y - nodes.get(current.end)!.point.y,
          nodes.get(current.start)!.point.x - nodes.get(current.end)!.point.x,
        );

        let best: Edge | null = null;
        let smallest = Infinity;

        for (const cand of nextEdges) {
          const diff = (cand.angle - incoming + Math.PI * 2) % (Math.PI * 2);

          if (diff > EPS && diff < smallest) {
            smallest = diff;
            best = cand;
          }
        }

        if (!best) break;

        current = best;

        if (current.start === e.start && current.end === e.end) break;
      }

      if (poly.length >= 3) faces.push(poly);
    }
  }

  // Filter valid rooms
  const rooms: Room[] = [];

  for (const poly of faces) {
    const area = signedArea(poly);

    // Keep clockwise (interior)
    if (area < -0.01) {
      rooms.push({
        id: crypto.randomUUID(),
        polygon: poly,
        area: Math.abs(area),
        centroid: centroid(poly),
      });
    }
  }

  return rooms;
}
