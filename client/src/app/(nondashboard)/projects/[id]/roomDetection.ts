import { Wall, Point, Room, Node, Edge } from "./types";

const EPS = 1e-6;

// Helpers
function key(p: Point) {
  return `${p.x.toFixed(4)},${p.y.toFixed(4)}`;
}

// Graph
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

  for (const list of adj.values()) {
    list.sort((a, b) => a.angle - b.angle);
  }

  return { nodes, adj };
}

// Polygon Area
function signedArea(poly: Point[]) {
  let a = 0;

  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;

    a += poly[i].x * poly[j].y - poly[j].x * poly[i].y;
  }

  return a / 2;
}

// Centroid
function centroid(poly: Point[]): Point {
  let cx = 0;
  let cy = 0;
  let A = 0;

  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;

    const cross = poly[i].x * poly[j].y - poly[j].x * poly[i].y;

    cx += (poly[i].x + poly[j].x) * cross;
    cy += (poly[i].y + poly[j].y) * cross;

    A += cross;
  }

  A *= 0.5;

  cx /= 6 * A;
  cy /= 6 * A;

  return { x: cx, y: cy };
}

// Room Detection
export function detectRooms(walls: Wall[]): Room[] {
  const { nodes, adj } = buildGraph(walls);

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

  const rooms: Room[] = [];
  let roomIndex = 1;

  for (const poly of faces) {
    const area = signedArea(poly);

    // keep only clockwise faces (interior rooms)
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
