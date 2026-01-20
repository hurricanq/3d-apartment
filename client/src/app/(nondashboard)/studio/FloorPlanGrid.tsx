"use client";

import React, { useMemo } from "react";
import { Line } from "react-konva";

interface GridProps {
  width: number;
  height: number;
  gridSize: number;
  stroke?: string;
}

const FloorPlanGrid = ({
  width,
  height,
  gridSize,
  stroke = "#000000",
}: GridProps) => {
  const gridLines = useMemo(() => {
    const lines = [];

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke={stroke}
          strokeWidth={1}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke={stroke}
          strokeWidth={1}
        />
      );
    }

    return lines;
  }, [width, height, gridSize, stroke]);

  return <>{gridLines}</>;
};

export default FloorPlanGrid;
