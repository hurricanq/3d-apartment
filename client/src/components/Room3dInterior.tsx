"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DragControls as ThreeDragControls } from "three-stdlib";
import floorplan from "@/data/floor-plan.json";
import { Button } from "@/components/ui/button";

function Floor({ rooms }: { rooms: any[] }) {
  return (
    <group>
      {rooms.map((room, i) => {
        const shape = new THREE.Shape();
        room.points.forEach(([x, y]: [number, number], idx: number) => {
          idx === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
        });
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false });
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial color={room.floorMaterial || "#ccc"} />
          </mesh>
        );
      })}
    </group>
  );
}

function Walls({ walls }: { walls: any[] }) {
  return (
    <group>
      {walls.map((wall, i) => {
        const length = Math.hypot(wall.end[0] - wall.start[0], wall.end[1] - wall.start[1]);
        const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
        const mesh = new THREE.Mesh(geometry);
        const midX = (wall.start[0] + wall.end[0]) / 2;
        const midZ = (wall.start[1] + wall.end[1]) / 2;
        mesh.position.set(midX, wall.height / 2, midZ);
        const angle = Math.atan2(wall.end[1] - wall.start[1], wall.end[0] - wall.start[0]);
        mesh.rotation.y = -angle;
        return (
          <mesh
            key={i}
            geometry={geometry}
            position={mesh.position}
            rotation={mesh.rotation}
          >
            <meshStandardMaterial color={"white"} />
          </mesh>
        );
      })}
    </group>
  );
}

function DraggableFurniture({ furnitureList, setFurnitureList, onSelect }: any) {
  const groupRef = useRef<any>(null);
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    if (!groupRef.current) return;
    const controls = new ThreeDragControls(groupRef.current.children, camera, gl.domElement);

    controls.addEventListener("drag", (event: any) => {
      const id = event.object.userData.id;
      setFurnitureList((prev: any) =>
        prev.map((f: any) =>
          f.id === id
            ? { ...f, position: [event.object.position.x, event.object.position.y, event.object.position.z] }
            : f
        )
      );
    });

    return () => controls.dispose();
  }, [camera, gl, setFurnitureList]);

  return (
    <group ref={groupRef}>
      {furnitureList.map((f: any) => (
        <mesh
          key={f.id}
          userData={{ id: f.id }}
          position={f.position}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(f.id);
          }}
          rotation={[0, f.rotation || 0, 0]}
        >
          <boxGeometry args={f.size} />
          <meshStandardMaterial color={f.color || "orange"} />
        </mesh>
      ))}
    </group>
  );
}

export default function Floor3DPage() {
  const [furnitureList, setFurnitureList] = useState<any[]>(floorplan.furniture || []);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);

  const rotateFurniture = (id: string) => {
    setFurnitureList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rotation: (f.rotation || 0) + Math.PI / 4 } : f))
    );
  };

  const deleteFurniture = (id: string) => {
    setFurnitureList((prev) => prev.filter((f) => f.id !== id));
    setSelectedFurniture(null);
  };

  const duplicateFurniture = (id: string) => {
    setFurnitureList((prev: any) => {
      const item = prev.find((f: any) => f.id === id);
      if (!item) return prev;
  
      const newItem = {
        ...item,
        id: Date.now().toString(), // unique ID
        position: [
          item.position[0] + 0.5, // slight offset on x
          item.position[1],
          item.position[2] + 0.5  // slight offset on z
        ],
      };
  
      return [...prev, newItem];
    });
  };

  return (
    <div className="relative w-screen h-screen">
      {/* Interaction menu */}
      {selectedFurniture && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-lg flex gap-2 z-10">
          <Button onClick={() => rotateFurniture(selectedFurniture)}>Rotate</Button>
          <Button onClick={() => deleteFurniture(selectedFurniture)}>Delete</Button>
          <Button onClick={() => duplicateFurniture(selectedFurniture)}>Duplicate</Button>
          <Button onClick={() => setSelectedFurniture(null)}>Close</Button>
        </div>
      )}

      <Canvas camera={{ position: [0, 400, 600], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[200, 400, 200]} intensity={1} />
        <OrbitControls />
        <gridHelper args={[1000, 50]} />

        <Floor rooms={floorplan.rooms} />
        <Walls walls={floorplan.walls} />

        <DraggableFurniture
          furnitureList={furnitureList}
          setFurnitureList={setFurnitureList}
          onSelect={setSelectedFurniture}
        />
      </Canvas>
    </div>
  );
}
