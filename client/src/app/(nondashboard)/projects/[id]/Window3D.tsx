import React from "react";
import * as THREE from "three";
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

  // Frame / glass dimensions
  const inset = 0.04; // glass inset from frame
  const glassWidth = Math.max(0.01, width - inset * 2);
  const glassHeight = Math.max(0.01, height - inset * 2);

  const frameMember = 0.06; // thickness of frame members
  const frameDepth = Math.max(0.06, WALL_THICKNESS + 0.02); // z-depth of frame
  const glassDepth = 0.02;

  return (
    <group position={[px + 0.05, cy, pz - 0.05]} rotation={[0, -angle, 0]}>
      {/* Frame - 4 members (top, bottom, left, right) */}
      {/* top */}
      <mesh
        position={[0, (height - frameMember) / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, frameMember, frameDepth]} />
        <meshStandardMaterial color="#222222" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* bottom */}
      <mesh
        position={[0, -(height - frameMember) / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, frameMember, frameDepth]} />
        <meshStandardMaterial color="#222222" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* left */}
      <mesh
        position={[-(width - frameMember) / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[frameMember, height - frameMember * 2, frameDepth]}
        />
        <meshStandardMaterial color="#222222" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* right */}
      <mesh
        position={[(width - frameMember) / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[frameMember, height - frameMember * 2, frameDepth]}
        />
        <meshStandardMaterial color="#222222" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Glass pane */}
      <mesh
        position={[0, 0, frameDepth / 2 - glassDepth / 2 + 0.001]}
        castShadow={false}
        receiveShadow
      >
        <boxGeometry args={[glassWidth, glassHeight, glassDepth]} />
        <meshPhysicalMaterial
          color="#aee3ff"
          transparent
          opacity={0.18}
          transmission={0.9}
          roughness={0}
          metalness={0}
          ior={1.45}
          thickness={0.02}
          reflectivity={0.5}
          clearcoat={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
