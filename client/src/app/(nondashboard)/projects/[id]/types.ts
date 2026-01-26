// types.ts

export type ToolMode = "select" | "draw-wall";

export interface Point {
  x: number;
  y: number;
}

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
