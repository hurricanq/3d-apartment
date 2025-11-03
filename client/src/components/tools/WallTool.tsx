"use client";

import { Line, Rect, Group, Circle, Text } from "react-konva";
import { useState } from "react";

interface WallToolProps {
    gridSize: number;
    canvasWidth: number;
    canvasHeight: number;
    enabled?: boolean;
}

export default function WallTool({ gridSize, canvasWidth, canvasHeight, enabled = false }: WallToolProps) {
    const [walls, setWalls] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
    const [isDrawing, setisDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
    const [previewEndPoint, setPreviewEndPoint] = useState<{ x: number, y: number } | null>(null);

    const [isHovered, setHovered] = useState<number | null>(null);
    const [isSelected, setSelected] = useState<number | null>(null);

    // Snap to grid helper
    function snapToGrid(value: number) {
      return Math.round(value / gridSize) * gridSize;
    }

    const handleClick = (e: any) => {
      const stage = e.target.getStage();
      const mousePos = stage.getPointerPosition();
      if (!mousePos) return;

      const snappedX = snapToGrid(mousePos.x);
      const snappedY = snapToGrid(mousePos.y);

      if (!isDrawing) {
        // Start drawing wall
        setStartPoint({ x: snappedX, y: snappedY });
        setisDrawing(true);
      } else {
        // End drawing wall
        if (startPoint) {
          setWalls([...walls, { x1: startPoint.x, y1: startPoint.y, x2: snappedX, y2: snappedY }])
        }
        setisDrawing(false);
        setStartPoint(null);
        setPreviewEndPoint(null);
      }
    };

    const handleMouseMove = (e: any) => {
      if (!enabled || !isDrawing || !startPoint) return;

      const stage = e.target.getStage();
      const mousePos = stage.getPointerPosition();
      if (!mousePos) return;

      const snappedX = snapToGrid(mousePos.x);
      const snappedY = snapToGrid(mousePos.y);
      setPreviewEndPoint({ x: snappedX, y: snappedY })
    }

    return (
      <>
        {/* Transparent background overlay (same size as grid) for drawing walls
          Overlay should be first so walls can receive events */}
        <Rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          fill="transparent"
          listening={enabled}
          onMouseDown={(e) => {
            handleClick(e);
          }}
          onMouseMove={handleMouseMove}
        />

        {/* Walls */}
        {walls.map((wall, i) => {
          const midX = (wall.x1 + wall.x2) / 2;
          const midY = (wall.y1 + wall.y2) / 2;

          return (
            <Group key={i}>
              <Line
                points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                stroke={(isHovered === i) || (isSelected === i) ? "#1d4ed8" : "#111"}
                strokeWidth={8}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((prev) => (prev === i ? null : prev))}
                onClick={(e) => {
                  e.cancelBubble = true;
                  setSelected((prev) => (prev === i ? null : i));
                }}
              />

              {/* Wall interactions */}
              {isSelected === i && (
                <Group
                  x={midX}
                  y={midY}
                  offsetX={30}
                  offsetY={50}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const updatedWalls = walls.filter((_, idx) => idx !== i);
                    setWalls(updatedWalls);
                    setSelected(null);
                  }}
                >
                  <Rect width={60} height={24} fill="#ef4444" cornerRadius={6} opacity={0.9} />
                  <Text x={8} y={5} text="Delete" fill="white" fontSize={14} />
                </Group>
              )}      
            </Group>
          );  
        })}

        {/* Preview wall while drawing */}
        {isDrawing && startPoint && previewEndPoint && (
          <Group>
            <Line
              points={[startPoint.x, startPoint.y, previewEndPoint.x, previewEndPoint.y]}
              stroke="green"
              strokeWidth={10}
            />
            <Circle x={startPoint.x} y={startPoint.y} radius={10} fill='green' />
          </Group>
        )}
      </>
    )
}