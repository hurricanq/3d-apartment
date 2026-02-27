import { Line } from "react-konva";
import { ToolMode, Wall, Door } from "./types";
import { findNearestWall } from "./pointToSegment";

export default function DoorLayer({
  doors,
  walls,
  scale,
  floorX,
  floorY,
  preview,
  onUpdateDoor,
  onSelectDoor,
  selectedDoorId,
  toolMode,
}: {
  doors: Door[];
  walls: Wall[];
  scale: number;
  floorX: number;
  floorY: number;
  preview?: {
    wallId: string;
    offset: number;
    width: number;
  } | null;
  onUpdateDoor: (id: string, data: Partial<Door>) => void;
  onSelectDoor: (id: string, pos: { x: number; y: number }) => void;
  selectedDoorId: string | null;
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
              stroke="#ff00ff"
              strokeWidth={6}
              opacity={0.5}
              dash={[6, 4]}
              listening={false}
            />
          );
        })()}

      {doors.map((door) => {
        const wall = walls.find((w) => w.id === door.wallId);
        if (!wall) return null;

        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const len = Math.hypot(dx, dy);

        const ux = dx / len;
        const uy = dy / len;

        const sx = wall.start.x + ux * door.offset;
        const sy = wall.start.y + uy * door.offset;
        const ex = sx + ux * door.width;
        const ey = sy + uy * door.width;

        return (
          <Line
            key={door.id}
            points={[
              floorX + sx * scale,
              floorY + sy * scale,
              floorX + ex * scale,
              floorY + ey * scale,
            ]}
            stroke={door.id === selectedDoorId ? "#ef4444" : "#00ff00"}
            strokeWidth={6}
            draggable={toolMode === "select"}
            onClick={(e) => {
              if (toolMode !== "select") return;

              e.cancelBubble = true;

              const stage = e.target.getStage();
              if (!stage) return;

              const pos = stage.getPointerPosition();
              if (!pos) return;

              onSelectDoor(door.id, pos);
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

              const newOffset = snap.projection.t * wallLen - door.width / 2;

              onUpdateDoor(door.id, {
                wallId: snap.wall.id,
                offset: Math.max(0, Math.min(wallLen - door.width, newOffset)),
              });
            }}
          />
        );
      })}
    </>
  );
}
