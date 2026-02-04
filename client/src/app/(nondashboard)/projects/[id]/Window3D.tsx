import React from "react";

import { Wall } from "./types";

interface Window3DProps {
  wall: Wall;
  offset: number; // meters
  width: number; // meters
  height: number; // meters
  sillHeight: number; // meters from floor
}

export default function Window3D({
  wall,
  offset,
  width,
  height,
  sillHeight,
}: Window3DProps) {
  // Wall direction
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.y - wall.start.y;
  const wallLength = Math.hypot(dx, dz);

  const ux = dx / wallLength;
  const uz = dz / wallLength;
  const angle = Math.atan2(dz, dx);

  // Window center position
  const cx = wall.start.x + ux * (offset + width / 2);
  const cz = wall.start.y + uz * (offset + width / 2);

  const cy = sillHeight + height / 2;

  return (
    <group position={[cx, cy, cz]} rotation={[0, -angle, 0]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Glass */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.02]} />
        <meshPhysicalMaterial
          transmission={1}
          roughness={0}
          thickness={0.01}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}
