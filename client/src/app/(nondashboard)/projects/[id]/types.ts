export type ViewMode = "2d" | "3d";
export type ToolMode = "select" | "draw-wall" | "draw-window" | "draw-door";

export interface Point {
  x: number;
  y: number;
}

export type Floor = {
  width: number;
  height: number;
  material: string;
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
};

export type Door = {
  id: string;
  wallId: string;
  offset: number; // meters from wall start
  width: number;
  height: number;
  swingDirection?: "in" | "out" | "left" | "right";
};

export type elementPreview = {
  wallId: string;
  offset: number;
  width: number;
};
