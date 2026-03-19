export type ViewMode = "2d" | "3d";
export type ToolMode = "select" | "draw-wall" | "draw-window" | "draw-door";

export interface Point {
  x: number;
  y: number;
}

export type Floor = {
  id: string;
  dimensions: {
    width: number;
    height: number;
  };
  color: string;
  material: string;
};

export type Ceiling = {
  width: number;
  height: number;
  zPos: number;
};

export type Wall = {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  dimensions: {
    height: number;
    depth: number;
  };
  color?: string;
  material?: string;
};

export type Window = {
  id: string;
  wallId: string;
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
  color?: string;
};

export type Door = {
  id: string;
  wallId: string;
  offset: number; // meters from wall start
  width: number;
  height: number;
  swingDirection?: "in" | "out" | "left" | "right";
  color?: string;
  isOpen?: boolean;
};

export type Room = {
  id: string;
  polygon: Point[];
  area: number;
  centroid: Point;
  material: string;
};

export type Node = {
  id: string;
  point: Point;
};

export type Edge = {
  start: string;
  end: string;
  angle: number;
};

export type ModelData = {
  id: number;
  url: string;
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
};

export type elementPreview = {
  wallId: string;
  offset: number;
  width: number;
};
