import { Window } from "./types";

export function WindowFrame({
  window,
  wallLength,
  wallDepth,
  onClick,
}: {
  window: Window;
  wallLength: number;
  wallDepth: number;
  onClick?: () => void;
}) {
  const { offset, width, height, sillHeight } = window;

  const frameX = offset + width / 2 - wallLength / 2;
  // y coordinate measured from floor
  const frameY = sillHeight + height / 2;
  const frameThickness = 0.05;

  return (
    <group position={[frameX, frameY, wallDepth / 2]}>
      {/* Window glass */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <boxGeometry args={[width - 0.08, height - 0.08, 0.02]} />
        <meshPhysicalMaterial
          color="#88ccff"
          transparent
          opacity={0.4}
          roughness={0}
          metalness={0.1}
          transmission={0.8}
          thickness={0.02}
        />
      </mesh>

      {/* Window frame - top */}
      <mesh position={[0, height / 2 - frameThickness / 2, 0.02]}>
        <boxGeometry args={[width + 0.02, frameThickness, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>

      {/* Window frame - bottom */}
      <mesh position={[0, -height / 2 + frameThickness / 2, 0.02]}>
        <boxGeometry args={[width + 0.02, frameThickness, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>

      {/* Window frame - left */}
      <mesh position={[-width / 2 + frameThickness / 2, 0, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>

      {/* Window frame - right */}
      <mesh position={[width / 2 - frameThickness / 2, 0, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>
    </group>
  );
}
