import { Door } from "./types";

export function DoorFrame({
  door,
  wallLength,
  wallDepth,
  onClick,
}: {
  door: Door;
  wallLength: number;
  wallDepth: number;
  wallHeight?: number;
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
  const doorThickness = 0.04;
  const panelWidth = width - 2 * frameThickness;
  const panelHeight = height - 0.08;

  // Determine which side the hinge is on (left or right frame)
  const isLeftHinge = swingDirection === "left";
  const hingeX = isLeftHinge
    ? -width / 2 + frameThickness
    : width / 2 - frameThickness;

  // Calculate local offset for the door panel so it spans the opening when closed
  const panelLocalX = isLeftHinge ? panelWidth / 2 : -panelWidth / 2;

  // Calculate the swing angle: when open, rotate 90 degrees
  // If swingDirection is right/out/etc, rotate accordingly
  let swingAngle = 0;
  if (isOpen) {
    if (swingDirection === "in" || swingDirection === "left") {
      swingAngle = Math.PI / 2;
    } else {
      swingAngle = -Math.PI / 2;
    }
  }

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
      <group position={[hingeX, height / 2, 0.02]} rotation={[0, swingAngle, 0]}>
        <mesh
          position={[panelLocalX, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <boxGeometry args={[panelWidth, panelHeight, doorThickness]} />
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
