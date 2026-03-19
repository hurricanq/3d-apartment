import { Door } from "./types";

export function DoorFrame({
  door,
  wallLength,
  wallDepth,
  wallHeight,
  onClick,
}: {
  door: Door;
  wallLength: number;
  wallDepth: number;
  wallHeight: number;
  onClick?: () => void;
}) {
  const {
    offset,
    width,
    height,
    swingDirection = "out",
    isOpen = false,
  } = door;

  const frameX = offset + width / 2 - wallLength / 2;
  const frameThickness = 0.06;

  const swingAngle = isOpen
    ? swingDirection === "out"
      ? -Math.PI / 2
      : swingDirection === "in"
        ? Math.PI / 2
        : 0
    : 0;

  // the frame group origin stays at the floor (0) now that the wall
  // geometry has been shifted; no need for vertical offsets here.
  return (
    <group position={[frameX, 0, wallDepth / 2]}>
      {/* Door frame - top */}
      <mesh position={[0, height - frameThickness / 2, 0.02]}>
        <boxGeometry args={[width + 0.04, frameThickness, 0.04]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>

      {/* Door frame - left */}
      <mesh position={[-width / 2 + frameThickness / 2, height / 2, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>

      {/* Door frame - right */}
      <mesh position={[width / 2 - frameThickness / 2, height / 2, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>

      {/* Door panel */}
      <group position={[0, height / 2, 0.03]} rotation={[0, swingAngle, 0]}>
        <mesh
          position={[width / 2 - 0.02, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <boxGeometry args={[0.04, height - 0.08, width - 0.08]} />
          <meshStandardMaterial color={door.color || "#8b5a2b"} />
        </mesh>
      </group>

      {/* Floor plate under door */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 0.02, wallDepth]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>
    </group>
  );
}
