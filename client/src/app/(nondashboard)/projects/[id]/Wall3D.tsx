import React from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { Wall } from "./types";
import { wallToMeshData } from "./wallToMeshData";

interface Wall3DProps {
  wall: Wall;
  highlighted?: boolean;
  onClick?: () => void;
  onHover?: (hover: boolean) => void;
}

export default function Wall3D({
  wall,
  highlighted = false,
  onClick,
  onHover,
}: Wall3DProps) {
  const { length, angle, center } = wallToMeshData(wall);

  const wallTexture = useTexture(`/textures/${wall.material}.jpg`);
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(10, 10);

  return (
    <mesh
      position={[center.x, wall.dimensions.height / 2, center.z]}
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
        map={wallTexture}
        color={highlighted ? "#60a5fa" : wall.color}
        emissive={highlighted ? new THREE.Color("#2563eb") : undefined}
        emissiveIntensity={highlighted ? 0.4 : 0}
      />
    </mesh>
  );
}
