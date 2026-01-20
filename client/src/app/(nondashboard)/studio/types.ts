// types.ts

export type ToolMode = "select" | "draw-wall";

export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
}
