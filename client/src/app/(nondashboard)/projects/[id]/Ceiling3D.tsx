import * as THREE from "three";
import { useMemo } from "react";
import { Point } from "./types";

interface Ceiling3DProps {
  polygon: Point[];
  wallHeight: number;
}

export default function Ceiling3D({ polygon, wallHeight }: Ceiling3DProps) {
  // Create ceiling geometry from polygon (matches the floor polygon exactly)
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    polygon.forEach((p, i) => {
      if (i === 0) shape.moveTo(p.x, -p.y);
      else shape.lineTo(p.x, -p.y);
    });

    shape.closePath(); // ensure closed polygon

    return new THREE.ShapeGeometry(shape);
  }, [polygon]);

  // White standard plaster ceiling material
  const ceilingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#f3f4f6", // soft off-white plaster color
      side: THREE.BackSide, // BackSide culls the top and renders the bottom (visible looking up, invisible looking down)
      roughness: 0.9,
    });
  }, []);

  return (
    <mesh
      geometry={geometry}
      material={ceilingMaterial}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, wallHeight - 0.01, 0]} // sits at wall height, slight offset to avoid z-fighting
      receiveShadow
    />
  );
}
