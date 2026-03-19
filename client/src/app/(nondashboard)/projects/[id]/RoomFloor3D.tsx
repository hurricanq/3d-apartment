import * as THREE from "three";
import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { Point } from "./types";

interface RoomFloor3DProps {
  polygon: Point[];
  material: string;
  highlighted?: boolean;
  onHover?: (hover: boolean) => void;
}

export default function RoomFloor3D({
  polygon,
  material,
  highlighted = false,
  onHover,
}: RoomFloor3DProps) {
  // Load texture
  const texture = useTexture(`/textures/${material}.jpg`);

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);

  // Create floor geometry from polygon
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    polygon.forEach((p, i) => {
      if (i === 0) shape.moveTo(p.x, -p.y);
      else shape.lineTo(p.x, -p.y);
    });

    shape.closePath(); // ensure closed polygon

    return new THREE.ShapeGeometry(shape);
  }, [polygon]);

  // Material with highlight support
  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: highlighted ? "#60a5fa" : "#e5e7eb",
      emissive: highlighted
        ? new THREE.Color("#2563eb")
        : new THREE.Color("#000000"),
      emissiveIntensity: highlighted ? 0.3 : 0,
      side: THREE.DoubleSide, // important for floors
    });
  }, [texture, highlighted]);

  return (
    <mesh
      geometry={geometry}
      material={floorMaterial}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]} // avoid z-fighting
      receiveShadow
      raycast={() => null}
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
    />
  );
}
