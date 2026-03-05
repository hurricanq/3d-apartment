import { Ceiling } from "./types";

export default function Ceiling3D({ width, height, zPos }: Ceiling) {
  return (
    <mesh
      rotation={[Math.PI / 2, 0, 0]}
      position={[width / 2, zPos, height / 2]}
    >
      {/* Plane in XZ */}
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  );
}
