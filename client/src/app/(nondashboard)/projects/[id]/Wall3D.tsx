import React from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface Wall3DProps {
  wall: {
    id?: string;
    dimensions: { height: number; depth: number };
    start: { x: number; y: number };
    end: { x: number; y: number };
    color?: string;
    material?: string;
  };
  material: string;
  highlighted?: boolean;
  onClick?: () => void;
  onHover?: (hover: boolean) => void;
}

export default function Wall3D({
  wall,
  material,
  highlighted = false,
  onClick,
  onHover,
}: Wall3DProps) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Center position in XZ plane
  const cx = (wall.start.x + wall.end.x) / 2;
  const cz = (wall.start.y + wall.end.y) / 2;

  const wallTexture = useTexture(`/textures/${material}.jpg`);
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(10, 10);

  return (
    <mesh
      position={[cx, wall.dimensions.height / 2, cz]}
      rotation={[0, -angle, 0]}
      receiveShadow
      castShadow
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover?.(false);
        document.body.style.cursor = "default";
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <boxGeometry
        args={[length, wall.dimensions.height, wall.dimensions.depth]}
      />

      <meshStandardMaterial
        color={highlighted ? "#60a5fa" : wall.color}
        emissive={highlighted ? new THREE.Color("#2563eb") : undefined}
        emissiveIntensity={highlighted ? 0.4 : 0}
      />
    </mesh>
  );
}
