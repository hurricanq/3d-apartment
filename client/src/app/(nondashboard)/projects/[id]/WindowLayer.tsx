import { Line } from "react-konva";
import { ToolMode, Wall, Window } from "./types";
import { findNearestWall } from "./pointToSegment";

export default function WindowLayer({
  windows,
  walls,
  scale,
  floorX,
  floorY,
  preview,
  onUpdateWindow,
  onSelectWindow,
  selectedWindowId,
  toolMode,
}: {
  windows: Window[];
  walls: Wall[];
  scale: number;
  floorX: number;
  floorY: number;
  preview?: {
    wallId: string;
    offset: number;
    width: number;
  } | null;
  onUpdateWindow: (id: string, data: Partial<Window>) => void;
  onSelectWindow: (id: string, pos: { x: number; y: number }) => void;
  selectedWindowId: string | null;
  toolMode: ToolMode;
}) {
  return (
    <>
      {preview &&
        (() => {
          const wall = walls.find((w) => w.id === preview.wallId);
          if (!wall) return null;

          const dx = wall.end.x - wall.start.x;
          const dy = wall.end.y - wall.start.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;

          const sx = wall.start.x + ux * preview.offset;
          const sy = wall.start.y + uy * preview.offset;
          const ex = sx + ux * preview.width;
          const ey = sy + uy * preview.width;

          return (
            <Line
              points={[
                floorX + sx * scale,
                floorY + sy * scale,
                floorX + ex * scale,
                floorY + ey * scale,
              ]}
              stroke="#60a5fa"
              strokeWidth={6}
              opacity={0.5}
              dash={[6, 4]}
              listening={false}
            />
          );
        })()}

      {windows.map((win) => {
        const wall = walls.find((w) => w.id === win.wallId);
        if (!wall) return null;

        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const len = Math.hypot(dx, dy);

        const ux = dx / len;
        const uy = dy / len;

        const sx = wall.start.x + ux * win.offset;
        const sy = wall.start.y + uy * win.offset;
        const ex = sx + ux * win.width;
        const ey = sy + uy * win.width;

        return (
          <Line
            key={win.id}
            points={[
              floorX + sx * scale,
              floorY + sy * scale,
              floorX + ex * scale,
              floorY + ey * scale,
            ]}
            stroke={win.id === selectedWindowId ? "#ef4444" : "#3b82f6"}
            strokeWidth={6}
            draggable={toolMode === "select"}
            onClick={(e) => {
              if (toolMode !== "select") return;

              e.cancelBubble = true;

              const stage = e.target.getStage();
              if (!stage) return;

              const pos = stage.getPointerPosition();
              if (!pos) return;

              onSelectWindow(win.id, pos);
            }}
            onDragMove={(e) => {
              const stage = e.target.getStage();
              if (!stage) return;

              const pos = stage.getPointerPosition();
              if (!pos) return;

              const worldPos = {
                x: (pos.x - floorX) / scale,
                y: (pos.y - floorY) / scale,
              };

              const snap = findNearestWall(worldPos, walls);
              if (!snap || snap.distance > 0.3) return;

              const wallLen = Math.hypot(
                snap.wall.end.x - snap.wall.start.x,
                snap.wall.end.y - snap.wall.start.y,
              );

              const newOffset = snap.projection.t * wallLen - win.width / 2;

              onUpdateWindow(win.id, {
                wallId: snap.wall.id,
                offset: Math.max(0, Math.min(wallLen - win.width, newOffset)),
              });
            }}
          />
        );
      })}
    </>
  );
}
