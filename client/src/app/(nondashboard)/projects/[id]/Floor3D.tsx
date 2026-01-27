import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface Floor3DProps {
  width: number; // meters
  height: number; // meters
  material: string;
}

export default function Floor3D({ width, height, material }: Floor3DProps) {
  const floorTexture = useTexture(`/textures/${material}.jpg`);
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, height / 2]}>
      {/* Plane in XZ */}
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#e5e7eb" map={floorTexture} />
    </mesh>
  );
}
