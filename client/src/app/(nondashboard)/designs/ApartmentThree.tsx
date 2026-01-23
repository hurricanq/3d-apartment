// ApartmentThree.tsx - Changing wall colors, duplicate furniture items
import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  useTexture,
  PointerLockControls,
} from "@react-three/drei"; // Added Box and Plane for walls/floor
import * as THREE from "three";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

import Model from "@/components/Model3";
import FPSCamera from "@/components/FPSCamera";
import floorPlan from "@/data/floor-plan.json";
import FurnitureList from "@/components/FurnitureList";
import { NAVBAR_HEIGHT } from "@/lib/constants";

interface ModelData {
  id: number;
  url: string;
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

function Floor({ width, height }: { width: number; height: number }) {
  const woodTexture = useTexture("/textures/dark-wood.jpg");
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(10, 10);

  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={woodTexture} />
    </mesh>
  );
}

function ImagePlane({
  url,
  width,
  height,
  position,
  rotation,
}: {
  url: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const texture = useTexture(url);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function ApartmentThree() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [selected, setSelected] = useState<number | null>(null); // For furniture
  const [wallColors, setWallColors] = useState<Record<string, string>>({}); // Map wall ID to color
  const transformRef = useRef<any>(null);
  const modelRefs = useRef(
    new Map<number, React.RefObject<THREE.Group | null>>(),
  );

  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
    "translate",
  ); // Toggle model manipulation
  const [cameraMode, setCameraMode] = useState<"orbit" | "fps">("orbit"); // Toggle camera mode
  const [dayNightMode, setDayNightMode] = useState<"day" | "night">("day"); // Toggle day/night (ambient and directional lighting)

  // Load furniture and initialize wall colors from JSON on mount
  useEffect(() => {
    const loadedModels: ModelData[] = [];
    const initialWallColors: Record<string, string> = {};
    floorPlan.rooms.forEach((room: any) => {
      room.furniture.forEach((item: any) => {
        const modelRef = React.createRef<THREE.Group>();
        modelRefs.current.set(item.id, modelRef);
        loadedModels.push({
          id: item.id,
          url: item.model,
          position: item.position,
          scale: item.scale || [1, 1, 1],
          rotation: item.rotation || [0, 0, 0],
        });
      });
      room.walls.forEach((wall: any) => {
        initialWallColors[wall.id] = wall.color || "#FFFFFF"; // Default to white if not set
      });
    });
    setModels(loadedModels);
    setWallColors(initialWallColors);
  }, []);

  // Add a new model
  const addModel = (modelUrl: string): void => {
    const id = Date.now();
    const modelRef = React.createRef<THREE.Group>();
    modelRefs.current.set(id, modelRef);
    const newModel: ModelData = {
      id,
      url: `/models/${modelUrl}`,
      position: [0, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    };
    setModels([...models, newModel]);
  };

  // Remove the selected model
  const removeModel = (): void => {
    if (selected) {
      modelRefs.current.delete(selected);
      setModels(models.filter((m) => m.id !== selected));
      setSelected(null);
    }
  };

  // Duplicate the selected model
  const duplicateModel = (): void => {
    if (selected) {
      const original = models.find((m) => m.id === selected);
      if (original) {
        const id = Date.now(); // Unique ID
        const modelRef = React.createRef<THREE.Group>();
        modelRefs.current.set(id, modelRef);
        const duplicated: ModelData = {
          id,
          url: original.url,
          position: [
            original.position[0] + 0.5, // Offset x by 0.5
            original.position[1],
            original.position[2],
          ],
          scale: original.scale,
          rotation: original.rotation,
        };
        setModels([...models, duplicated]);
      }
    }
  };

  // Handle model selection
  const handleSelect = (id: number): void => {
    setSelected(id);
  };

  // Handle deselection by clicking outside
  const handleDeselect = (): void => {
    setSelected(null);
  };

  // Clamp position
  const clampPosition = (object: THREE.Object3D): void => {
    object.position.x = Math.max(-3, Math.min(3, object.position.x));
    object.position.y = Math.max(0, Math.min(2, object.position.y));
    object.position.z = Math.max(-3, Math.min(3, object.position.z));
  };

  const saveDesign = async () => {
    // Ensure we capture the *current* position/rotation from modelRefs (not only initial state)
    const furniture = models.map((m) => {
      const ref = modelRefs.current.get(m.id)?.current;
      return {
        id: m.id,
        url: m.url,
        position: ref
          ? [ref.position.x, ref.position.y, ref.position.z]
          : m.position,
        rotation: ref
          ? [ref.rotation.x, ref.rotation.y, ref.rotation.z]
          : m.rotation,
        scale: m.scale,
      };
    });

    const design = {
      furniture,
      walls: wallColors,
      settings: {
        cameraMode,
        dayNightMode,
      },
    };

    console.log("Saved design:", design);

    // TODO: send to backend
    await fetch("/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(design),
    });
  };

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div
          className="relative h-screen"
          style={{ marginTop: `${-NAVBAR_HEIGHT}px` }}
        >
          <Canvas
            camera={{ position: [0, 1.6, 2], fov: 75 }}
            onPointerMissed={handleDeselect}
            shadows
          >
            <color
              attach="background"
              args={[dayNightMode === "day" ? "#FFFFFF" : "#111111"]}
            />

            {/* Lighting (day/night) */}
            {dayNightMode === "day" && (
              <group>
                <ambientLight intensity={1} />
                <directionalLight
                  color="white"
                  position={[1, 1, 0]}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
              </group>
            )}
            {dayNightMode === "night" && (
              <pointLight
                position={[0, 2, 0]}
                intensity={20}
                color="#fff"
                castShadow
              />
            )}

            <gridHelper args={[50, 100]} />

            {/* Render walls with dynamic colors */}
            {floorPlan.rooms.map((room) => (
              <group key={room.id}>
                {/* Floor */}
                <Floor
                  width={room.dimensions.width}
                  height={room.dimensions.height}
                />

                {/* Walls */}
                {room.walls.map((wall) => (
                  <mesh
                    key={wall.id}
                    position={[
                      wall.position[0],
                      wall.position[1],
                      wall.position[2],
                    ]}
                    rotation={
                      (wall.rotation ?? [0, 0, 0]) as [number, number, number]
                    }
                    receiveShadow
                    castShadow={false}
                  >
                    <planeGeometry
                      args={[wall.dimensions.width, wall.dimensions.height]}
                    />
                    <meshStandardMaterial color={wall.color} />
                  </mesh>
                ))}

                {/* Ceiling */}
                <mesh
                  position={[
                    room.ceiling.position[0],
                    room.ceiling.position[1],
                    room.ceiling.position[2],
                  ]}
                  rotation={[
                    room.ceiling.rotation[0],
                    room.ceiling.rotation[1],
                    room.ceiling.rotation[2],
                  ]}
                  receiveShadow
                >
                  <planeGeometry
                    args={[
                      room.ceiling.dimensions.width,
                      room.ceiling.dimensions.height,
                    ]}
                  />
                  <meshStandardMaterial color={room.ceiling.color} />
                </mesh>

                {/* Posters */}
                {room.images.map((image) => (
                  <ImagePlane
                    key={image.id}
                    url={image.url}
                    width={image.dimensions.width}
                    height={image.dimensions.height}
                    position={[
                      image.position[0],
                      image.position[1],
                      image.position[2],
                    ]}
                    rotation={[
                      image.rotation[0],
                      image.rotation[1],
                      image.rotation[2],
                    ]}
                  />
                ))}
              </group>
            ))}

            {/* Render furniture */}
            {models.map((model) => (
              <Model
                key={model.id}
                ref={modelRefs.current.get(model.id)}
                url={model.url}
                position={model.position}
                scale={model.scale}
                rotation={model.rotation}
                onClick={() => handleSelect(model.id)}
              >
                {/* If this model should emit light */}
                {model.url.includes("lamp") && (
                  <pointLight
                    intensity={10}
                    distance={5}
                    color="#ffddaa"
                    position={[0, 1, 0]} // Based on model origin
                    castShadow
                  />
                )}
              </Model>
            ))}

            {/* TransformControls for furniture only */}
            {selected && modelRefs.current.get(selected)?.current && (
              <TransformControls
                ref={transformRef}
                object={modelRefs.current.get(selected)!.current!}
                mode={mode}
                onObjectChange={(e: any) => clampPosition(e.target.object)}
              />
            )}

            {/* Camera: Orbit mode */}
            {cameraMode === "orbit" && (
              <OrbitControls
                enabled={!selected}
                enablePan={false}
                enableRotate={true}
                rotateSpeed={0.6}
              />
            )}

            {/* Camera: FPS mode */}
            {cameraMode === "fps" && (
              <>
                <FPSCamera /> {/* WASD movement */}
                <PointerLockControls /> {/* Mouse look */}
              </>
            )}
          </Canvas>

          {/* UI Buttons */}
          <div className="absolute top-20 left-5 z-10 flex flex-col gap-2">
            <div className="flex gap-2">
              {/* Add furniture */}
              <FurnitureList onClick={addModel} />
            </div>

            <div className="flex gap-2">
              {/* Toggle camera mode */}
              <button
                onClick={() =>
                  setCameraMode(cameraMode === "orbit" ? "fps" : "orbit")
                }
                className="px-3 py-1 rounded bg-white shadow"
              >
                {cameraMode === "orbit" ? "FPS Walk" : "Orbit Look"}
              </button>

              {/* Toggle day/night mode */}
              <button
                onClick={() =>
                  setDayNightMode(dayNightMode === "day" ? "night" : "day")
                }
                className="px-3 py-1 rounded bg-white shadow"
              >
                {dayNightMode === "day" ? "Night Mode" : "Day Mode"}
              </button>

              <button
                onClick={saveDesign}
                className="px-3 py-1 rounded bg-blue-500 text-white shadow"
              >
                Save Design
              </button>
            </div>

            <div className="flex gap-2">
              {selected && (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded bg-white shadow"
                    onClick={() => setMode("translate")}
                  >
                    Translate
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-white shadow"
                    onClick={() => setMode("rotate")}
                  >
                    Rotate
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-white shadow"
                    onClick={() => setMode("scale")}
                  >
                    Scale
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-white shadow"
                    onClick={duplicateModel}
                  >
                    Duplicate
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-400 text-white shadow"
                    onClick={removeModel}
                    disabled={!selected}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}
