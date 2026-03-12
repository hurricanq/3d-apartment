import React from "react";
import { Layer, Line, Text, Group } from "react-konva";

interface DimensionLayerProps {
  floorX: number;
  floorY: number;
  floorWidth: number; // in meters
  floorHeight: number; // in meters
  pixelsPerMeter: number;
}

const DimensionLayer: React.FC<DimensionLayerProps> = ({
  floorX,
  floorY,
  floorWidth,
  floorHeight,
  pixelsPerMeter,
}) => {
  const dimensionOffset = 40; // Distance from floor edge in pixels
  const fontSize = 14;

  // Convert meter dimensions to pixels
  const floorWidthPx = floorWidth * pixelsPerMeter;
  const floorHeightPx = floorHeight * pixelsPerMeter;

  // Calculate positions for width dimension (bottom)
  const widthDimensionY = floorY + floorHeightPx + dimensionOffset;
  const widthStart = { x: floorX, y: widthDimensionY };
  const widthEnd = { x: floorX + floorWidthPx, y: widthDimensionY };

  // Calculate positions for height dimension (right)
  const heightDimensionX = floorX + floorWidthPx + dimensionOffset;
  const heightStart = { x: heightDimensionX, y: floorY };
  const heightEnd = { x: heightDimensionX, y: floorY + floorHeightPx };

  // Helper component for dimension tick marks
  const DimensionTick = ({
    x,
    y,
    isHorizontal,
  }: {
    x: number;
    y: number;
    isHorizontal: boolean;
  }) => {
    const tickLength = 8;
    return (
      <Line
        points={[
          x - (isHorizontal ? tickLength / 2 : 0),
          y - (isHorizontal ? 0 : tickLength / 2),
          x + (isHorizontal ? tickLength / 2 : 0),
          y + (isHorizontal ? 0 : tickLength / 2),
        ]}
        stroke="#333333"
        strokeWidth={1}
      />
    );
  };

  // Helper to create dimension line with arrows
  const renderDimensionLine = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    isHorizontal: boolean,
    valueMeters: number,
  ) => {
    const text = `${valueMeters.toFixed(2)} m`;
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Calculate dimension angle in degrees
    const dimensionAngle = Math.atan2(end.y - start.y, end.x - start.x);
    const rotation = (dimensionAngle * 180) / Math.PI;

    return (
      <Group>
        {/* Main dimension line */}
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke="#333333"
          strokeWidth={1.5}
        />

        {/* Left/Top tick mark */}
        <DimensionTick x={start.x} y={start.y} isHorizontal={isHorizontal} />

        {/* Right/Bottom tick mark */}
        <DimensionTick x={end.x} y={end.y} isHorizontal={isHorizontal} />

        {/* Measurement text with rotation */}
        <Group>
          {/* Text background */}
          <Text
            x={rotation === 90 ? midX + 20 : midX}
            y={rotation === 90 ? midY : midY + 20}
            text={text}
            fontSize={fontSize}
            fontFamily="Inter"
            fontStyle="bold"
            fill="#2563eb"
            align="center"
            offsetX={30}
            offsetY={10}
            rotation={rotation}
            shadowColor="white"
            shadowBlur={4}
            shadowOpacity={0.8}
          />
        </Group>
      </Group>
    );
  };

  return (
    <Layer>
      {/* Width dimension (horizontal - below floor) */}
      {renderDimensionLine(widthStart, widthEnd, true, floorWidth)}

      {/* Height dimension (vertical - right of floor) */}
      {renderDimensionLine(heightStart, heightEnd, false, floorHeight)}
    </Layer>
  );
};

export default DimensionLayer;
