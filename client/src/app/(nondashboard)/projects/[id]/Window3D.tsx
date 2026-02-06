import React from "react";
import { Wall } from "./types";

interface Window3DProps {
  wall: Wall;
  offset: number; // meters from wall start
  width: number;
  height: number;
  sillHeight: number;
}

export default function Window3D({
  wall,
  offset,
  width,
  height,
  sillHeight,
}: Window3DProps) {
  // Wall position
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.y - wall.start.y;

  const wallLength = Math.hypot(dx, dz);

  if (wallLength === 0) return null;

  const ux = dx / wallLength;
  const uz = dz / wallLength;

  const angle = Math.atan2(dz, dx);

  // Window position
  // Center along wall
  const cx = wall.start.x + ux * (offset + width / 2);
  const cz = wall.start.y + uz * (offset + width / 2);

  // Height
  const cy = sillHeight + height / 2;

  // Push slightly outward from wall
  const WALL_THICKNESS = wall.dimensions?.depth ?? 0.1;
  const OUT = WALL_THICKNESS / 2 + 0.02;

  const px = cx - uz * OUT;
  const pz = cz + ux * OUT;

  return (
    <group position={[px + 0.05, cy, pz - 0.05]} rotation={[0, -angle, 0]}>
      {/* Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Glass */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.21]} />
        <meshStandardMaterial color="#add8e6" />
      </mesh>
    </group>
  );
}
