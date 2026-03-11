import * as THREE from "three";
import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { Point } from "./types";

interface RoomFloor3DProps {
  polygon: Point[];
  material: string;
}

export default function RoomFloor3D({ polygon, material }: RoomFloor3DProps) {
  const texture = useTexture(`/textures/${material}.jpg`);

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    polygon.forEach((p, i) => {
      if (i === 0) shape.moveTo(p.x, -p.y);
      else shape.lineTo(p.x, -p.y);
    });

    return new THREE.ShapeGeometry(shape);
  }, [polygon]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial map={texture} color="#e5e7eb" />
    </mesh>
  );
}
