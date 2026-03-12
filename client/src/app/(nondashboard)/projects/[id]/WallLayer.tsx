"use client";

import { Line, Text, Group } from "react-konva";
import { Wall, ToolMode } from "./types";

interface WallLayerProps {
  walls: Wall[];
  pixelsPerMeter: number;
  floorX: number;
  floorY: number;

  toolMode: ToolMode;

  hoveredWallId: string | null;
  selectedWallId: string | null;

  onHoverWall: (wallId: string | null) => void;
  onSelectWall: (wallId: string, screenPos: { x: number; y: number }) => void;
}

export default function WallLayer({
  walls,
  pixelsPerMeter,
  floorX,
  floorY,
  toolMode,
  hoveredWallId,
  selectedWallId,
  onHoverWall,
  onSelectWall,
}: WallLayerProps) {
  return (
    <>
      {walls.map((wall) => {
        const isHovered = wall.id === hoveredWallId;
        const isSelected = wall.id === selectedWallId;

        const x1 = floorX + wall.start.x * pixelsPerMeter;
        const y1 = floorY + wall.start.y * pixelsPerMeter;
        const x2 = floorX + wall.end.x * pixelsPerMeter;
        const y2 = floorY + wall.end.y * pixelsPerMeter;

        // Calculate wall length in meters
        const wallLength = Math.hypot(
          wall.end.x - wall.start.x,
          wall.end.y - wall.start.y,
        );

        // Calculate midpoint for text positioning
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Calculate wall angle in degrees
        const wallAngle = Math.atan2(
          wall.end.y - wall.start.y,
          wall.end.x - wall.start.x,
        );
        const rotation = (wallAngle * 180) / Math.PI;

        // Offset for text (perpendicular to wall direction)
        const textOffset = 25;

        return (
          <Group key={wall.id}>
            {/* Wall Line */}
            <Line
              points={[x1, y1, x2, y2]}
              stroke={
                isSelected
                  ? "#dc2626" // dark red
                  : isHovered
                    ? "#f87171" // light red
                    : "#111827"
              }
              strokeWidth={wall.dimensions.depth * pixelsPerMeter}
              lineCap="square"
              listening={toolMode === "select"}
              onMouseEnter={() => {
                if (toolMode === "select") {
                  onHoverWall(wall.id);
                  document.body.style.cursor = "pointer";
                }
              }}
              onMouseLeave={() => {
                onHoverWall(null);
                document.body.style.cursor = "default";
              }}
              onClick={(e) => {
                if (toolMode !== "select") return;

                const stage = e.target.getStage();
                const pointer = stage?.getPointerPosition();

                if (!pointer) return;

                onSelectWall(wall.id, {
                  x: pointer.x,
                  y: pointer.y,
                });
              }}
            />

            {/* Wall Length Text (only show on hover, rotated to match wall) */}
            {isHovered && (
              <Text
                x={midX}
                y={midY - textOffset}
                text={`${wallLength.toFixed(2)} m`}
                fontSize={14}
                fontFamily="Inter"
                fontStyle="bold"
                fill="#2563eb"
                align="center"
                offsetX={20}
                offsetY={rotation === 90 ? 20 : 0}
                rotation={rotation}
                shadowColor="white"
                shadowBlur={4}
                shadowOpacity={0.8}
              />
            )}
          </Group>
        );
      })}
    </>
  );
}
