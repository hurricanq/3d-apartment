export function snapValue(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function snapPoint(point: { x: number; y: number }, step: number) {
  return {
    x: snapValue(point.x, step),
    y: snapValue(point.y, step),
  };
}
