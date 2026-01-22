"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import Floor3D from "./Floor3D";
import Wall3D from "./Wall3D";
import { Wall } from "./types";

interface Scene3DProps {
  floor: {
    width: number;
    height: number;
  };
  walls: Wall[];
}

export default function Scene3D({ floor, walls }: Scene3DProps) {
  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Controls */}
      <OrbitControls />

      {/* Optional ground grid */}
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={1}
        sectionSize={5}
        fadeDistance={30}
      />

      {/* Floor */}
      <Floor3D width={floor.width} height={floor.height} />

      {/* Walls */}
      {walls.map((wall) => (
        <Wall3D key={wall.id} wall={wall} height={3} />
      ))}
    </Canvas>
  );
}
