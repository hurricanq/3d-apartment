import React from "react";
import * as THREE from "three";

interface Door3DProps {
  wall: {
    id: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    dimensions: { height: number; depth: number };
  };
  offset: number;
  width: number;
  height: number;
  swingDirection?: "in" | "out" | "left" | "right";
}

export default function Door3D({
  wall,
  offset,
  width,
  height,
  swingDirection = "out",
}: Door3DProps) {
  // Calculate door position along the wall
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.hypot(dx, dy);

  const ux = dx / wallLength;
  const uy = dy / wallLength;

  // Door center position
  const doorCenterX = offset + width / 2 - wallLength / 2;
  const doorCenterY = height / 2;

  // Calculate swing angle based on direction
  const swingAngle =
    swingDirection === "out"
      ? -Math.PI / 2
      : swingDirection === "in"
        ? Math.PI / 2
        : swingDirection === "left"
          ? Math.PI
          : 0;

  return (
    <group position={[doorCenterX, 0, 0]} rotation={[0, 0, 0]}>
      {/* Door frame */}
      <mesh position={[0, height / 2, wall.dimensions.depth / 2 + 0.01]}>
        <boxGeometry args={[width + 0.05, height, 0.03]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>

      {/* Door panel */}
      <group position={[0, height / 2, wall.dimensions.depth / 2 + 0.02]}>
        <mesh position={[width / 2 - 0.02, 0, 0]}>
          <boxGeometry args={[0.04, height - 0.05, width - 0.04]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>

        {/* Door handle */}
        <mesh position={[0.05, height / 2 - 0.1, 0.05]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color="#c0c0c0"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Door swing arc indicator (optional - subtle) */}
      <mesh
        position={[0, 0.02, wall.dimensions.depth / 2 + 0.01]}
        rotation={[-Math.PI / 2, 0, swingAngle]}
      >
        <ringGeometry
          args={[width - 0.1, width - 0.05, 32, 1, 0, Math.PI / 2]}
        />
        <meshBasicMaterial
          color="#cccccc"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
