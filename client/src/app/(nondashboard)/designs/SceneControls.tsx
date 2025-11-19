"use client";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, TransformControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

// ---------- Floor ----------
function Floor({ planeY, onClick }: { planeY: number; onClick?: () => void }) {
  const woodTexture = useTexture("/textures/wood.jpg");
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(10, 10);

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      receiveShadow
      position={[0, planeY, 0]}
      onClick={onClick}
    >
      <boxGeometry args={[20, 20, 0.1]} />
      <meshStandardMaterial map={woodTexture} />
    </mesh>
  );
}

// ---------- Wall ----------
function Wall({
  wallX,
  wallY,
  wallZ,
  rotY,
  onClick,
}: {
  wallX: number;
  wallY: number;
  wallZ: number;
  rotY: number;
  onClick?: () => void;
}) {
  return (
    <mesh
      position={[wallX, wallY, wallZ]}
      rotation-y={rotY}
      onClick={onClick}
      receiveShadow
      castShadow
    >
      <boxGeometry args={[20, 10, 0]} />
      <meshStandardMaterial color="#fff" />
    </mesh>
  );
}

// ---------- Cube ----------
function Cube({
  selected,
  onSelect,
  cubeRef,
  planeY,
}: {
  selected: boolean;
  onSelect: () => void;
  cubeRef: React.RefObject<THREE.Mesh | null>;
  planeY: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [colliding, setColliding] = useState(false);
  const { camera, raycaster, mouse } = useThree();

  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffset = useRef(new THREE.Vector3());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    plane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, cubeRef.current!.position.y, 0)
    );

    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane.current, intersection);
    dragOffset.current.copy(intersection).sub(cubeRef.current!.position);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !cubeRef.current) return;
    e.stopPropagation();

    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane.current, intersection);
    cubeRef.current.position.copy(intersection.sub(dragOffset.current));
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // Collision detection
  useFrame(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const halfHeight = 0.5;
    const bottomY = cube.position.y - halfHeight;
    if (bottomY <= planeY) {
      cube.position.y = planeY + halfHeight;
      if (!colliding) {
        setColliding(true);
        console.log("💥 Collision detected with plane!");
      }
    } else if (colliding) {
      setColliding(false);
    }
  });

  return (
    <mesh
      ref={cubeRef}
      position={[0, 0.5, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={colliding ? "red" : selected ? "orange" : "skyblue"}
      />
    </mesh>
  );
}

// ---------- Main Scene ----------
export default function SceneTransControls() {
  const orbitRef = useRef<any>(null);
  const transformRef = useRef<any>(null);

  const [cubes, setCubes] = useState<{ id: number; position: [number, number, number] }[]>([
    { id: 1, position: [0, 0.5, 0] },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">("translate");

  const planeY = 0;

  // 🟢 Stable cube refs storage (prevents hook order issues)
  const cubeRefs = useRef<Record<number, THREE.Mesh | null>>({});

  // Add Cube
  const handleAddCube = () => {
    const newId = Date.now();
    const offsetX = Math.random() * 4 - 2;
    const offsetZ = Math.random() * 4 - 2;
    setCubes((prev) => [...prev, { id: newId, position: [offsetX, 0.5, offsetZ] }]);
  };

  // Remove Cube
  const handleRemoveCube = () => {
    if (selectedId === null) return;
    setCubes((prev) => prev.filter((cube) => cube.id !== selectedId));
    delete cubeRefs.current[selectedId];
    setSelectedId(null);
  };

  // Disable orbit controls while using transform gizmo
  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;
    const handleDrag = (event: any) => {
      if (orbitRef.current) orbitRef.current.enabled = !event.value;
    };
    controls.addEventListener("dragging-changed", handleDrag);
    return () => controls.removeEventListener("dragging-changed", handleDrag);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedId === null) return;
      switch (e.key.toLowerCase()) {
        case "g":
          setMode("translate");
          break;
        case "r":
          setMode("rotate");
          break;
        case "s":
          setMode("scale");
          break;
        case "escape":
          setSelectedId(null);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedId]);

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [3, 3, 5], fov: 60 }} shadows>
        {/* Lighting */}
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />

        <OrbitControls ref={orbitRef} makeDefault enableDamping={false} />

        <gridHelper args={[100, 50]} />

        {/* Floor & Walls */}
        <Floor planeY={planeY} onClick={() => setSelectedId(null)} />
        <Wall wallX={0} wallY={5} wallZ={10} rotY={0} />
        <Wall wallX={0} wallY={5} wallZ={-10} rotY={0} />
        <Wall wallX={-10} wallY={5} wallZ={0} rotY={Math.PI / 2} />
        <Wall wallX={10} wallY={5} wallZ={0} rotY={Math.PI / 2} />

        {/* Render Cubes */}
        {cubes.map((cube) => (
          <Cube
            key={cube.id}
            selected={cube.id === selectedId}
            onSelect={() => setSelectedId(cube.id)}
            cubeRef={{
              get current() {
                return cubeRefs.current[cube.id] || null;
              },
              set current(value: THREE.Mesh | null) {
                cubeRefs.current[cube.id] = value;
              },
            }}
            planeY={planeY}
          />
        ))}

        {/* Transform Controls */}
        {selectedId && cubeRefs.current[selectedId] && (
          <TransformControls
            ref={transformRef}
            object={cubeRefs.current[selectedId]!}
            mode={mode}
          />
        )}
      </Canvas>

      {/* UI Buttons */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button onClick={handleAddCube} className="px-3 py-1 bg-green-600 rounded text-white">
            ➕ Add Cube
          </button>
          <button
            onClick={handleRemoveCube}
            disabled={selectedId === null}
            className={`px-3 py-1 rounded text-white ${
              selectedId ? "bg-red-600" : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            🗑️ Remove Cube
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          {["translate", "rotate", "scale"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-3 py-1 rounded text-white ${
                mode === m ? "bg-blue-500" : "bg-gray-700"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Shortcut Hint */}
      <div className="absolute bottom-4 left-4 text-gray-300 text-sm">
        💡 Shortcuts: <b>G</b> = Move, <b>R</b> = Rotate, <b>S</b> = Scale, <b>Esc</b> = Deselect
      </div>
    </div>
  );
}
