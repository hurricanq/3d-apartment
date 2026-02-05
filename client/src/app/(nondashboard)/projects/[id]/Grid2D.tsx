"use client";

import React, { useMemo } from "react";
import { Line } from "react-konva";

import { Grid2DProps } from "@/types/floorPlan";

const Grid2D = ({
  width,
  height,
  cellSize,
  mainStroke = "#A9A9A9",
  subStroke = "#D3D3D3",
}: Grid2DProps) => {
  // Function for generating main (dark gray) lines
  const mainLines = useMemo(() => {
    const mLines = [];

    // Vertical main lines
    for (let x = 0; x <= width; x += cellSize) {
      mLines.push(
        <Line
          key={`mv-${x}`}
          points={[x, 0, x, height]}
          stroke={mainStroke}
          strokeWidth={1}
        />,
      );
    }

    // Horizontal main lines
    for (let y = 0; y <= height; y += cellSize) {
      mLines.push(
        <Line
          key={`mh-${y}`}
          points={[0, y, width, y]}
          stroke={mainStroke}
          strokeWidth={1}
        />,
      );
    }

    return mLines;
  }, [width, height, cellSize, mainStroke]);

  // Function for generating sub (light gray) lines
  const subLines = useMemo(() => {
    const sLines = [];
    const sCell = cellSize / 5;

    // Vertical sub lines
    for (let x = 0; x <= width; x += sCell) {
      sLines.push(
        <Line
          key={`sv-${x}`}
          points={[x, 0, x, height]}
          stroke={subStroke}
          strokeWidth={1}
        />,
      );
    }

    // Horizontal sub lines
    for (let y = 0; y <= height; y += sCell) {
      sLines.push(
        <Line
          key={`sh-${y}`}
          points={[0, y, width, y]}
          stroke={subStroke}
          strokeWidth={1}
        />,
      );
    }

    return sLines;
  }, [width, height, cellSize, subStroke]);

  return (
    <>
      {subLines}
      {mainLines}
    </>
  );
};

export default Grid2D;
