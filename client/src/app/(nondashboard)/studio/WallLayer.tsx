"use client";

import { Line, Circle } from "react-konva";
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

        return (
          <Line
            key={wall.id}
            points={[x1, y1, x2, y2]}
            stroke={
              isSelected
                ? "#dc2626" // dark red
                : isHovered
                  ? "#f87171" // light red
                  : "#111827"
            }
            strokeWidth={wall.thickness * pixelsPerMeter}
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
        );
      })}
    </>
  );
}
