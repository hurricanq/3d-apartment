import { Mesh } from "three";

interface Floor3DProps {
  width: number; // meters
  height: number; // meters
}

export default function Floor3D({ width, height }: Floor3DProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, height / 2]}>
      {/* Plane in XZ */}
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  );
}
