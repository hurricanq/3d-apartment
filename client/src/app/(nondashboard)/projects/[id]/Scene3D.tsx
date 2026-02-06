"use client";

import React, { useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  PointerLockControls,
  Grid,
  PerspectiveCamera,
} from "@react-three/drei";

import Floor3D from "./Floor3D";
import Wall3D from "./Wall3D";
import Model from "@/components/Model";
import FPSCamera from "@/components/FPSCamera";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";

import {
  FootprintsIcon,
  OrbitIcon,
  MoonIcon,
  SunIcon,
  Move3DIcon,
  Rotate3DIcon,
  Scale3DIcon,
  CopyIcon,
  TrashIcon,
  CameraIcon,
} from "lucide-react";

import { Floor, Wall, Window } from "./types";
import FurnitureList from "@/components/FurnitureList";
import MaterialList from "@/components/MaterialList";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import Window3D from "./Window3D";

interface ModelData {
  id: number;
  url: string;
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
}

interface Scene3DProps {
  floor: Floor;
  walls: Wall[];
  windows: Window[];
}

export default function Scene3D({ floor, walls, windows }: Scene3DProps) {
  // Selection states
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [hoveredWall, setHoveredWall] = useState<string | null>(null);

  // UI modes
  const [cameraMode, setCameraMode] = useState<"orbit" | "fps">("orbit");
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");

  const [dayNight, setDayNight] = useState<"day" | "night">("day");

  // Light controls
  const [ambientIntensity, setAmbientIntensity] = useState(1);
  const [pointIntensity, setPointIntensity] = useState(20);
  const [pointPosition, setPointPosition] = useState<[number, number, number]>([
    4, 2, 3,
  ]);

  // Refs
  const transformRef = useRef<TransformControlsImpl>(null);
  const modelRefs = useRef(
    new Map<number, React.RefObject<THREE.Group | null>>(),
  );
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  const [models, setModels] = useState<ModelData[]>([]);
  const [renderMode, setRenderMode] = useState(false);

  const [wallsState, setWallsState] = useState(walls);

  // Add a new model
  const addModel = (modelUrl: string): void => {
    const id = Date.now();
    const modelRef = React.createRef<THREE.Group>();
    modelRefs.current.set(id, modelRef);
    const newModel: ModelData = {
      id,
      url: `/models/${modelUrl}`,
      position: [4, 0, 4],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      color: "#FFFFFF",
    };
    setModels([...models, newModel]);
  };

  // Remove the selected model
  const removeModel = (): void => {
    if (selectedModel) {
      modelRefs.current.delete(selectedModel);
      setModels(models.filter((m) => m.id !== selectedModel));
      setSelectedModel(null);
    }
  };

  // Duplicate the selected model
  const duplicateModel = (): void => {
    if (selectedModel) {
      const original = models.find((m) => m.id === selectedModel);
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
          color: original.color,
        };
        setModels([...models, duplicated]);
      }
    }
  };

  // Update wall color
  const updateWallColor = (color: string): void => {
    if (!selectedWall) return;
    setWallsState((prevWalls) =>
      prevWalls.map((wall) =>
        wall.id === selectedWall ? { ...wall, color } : wall,
      ),
    );
  };

  const handleChangeMaterial = (name: string) => {
    if (!selectedWall) return;
    setWallsState((prevWalls) =>
      prevWalls.map((wall) =>
        wall.id === selectedWall ? { ...wall, material: name } : wall,
      ),
    );
  };

  const updateModelColor = (color: string): void => {
    if (!selectedModel) return;

    setModels((prev) =>
      prev.map((m) => (m.id === selectedModel ? { ...m, color } : m)),
    );
  };

  const clampPosition = (object: THREE.Object3D): void => {
    object.position.x = Math.max(0, Math.min(8, object.position.x));
    object.position.y = Math.max(0, Math.min(2.5, object.position.y));
    object.position.z = Math.max(0, Math.min(6, object.position.z));

    setModels((prevModels) =>
      prevModels.map((m) => {
        if (m.id === selectedModel) {
          const group = modelRefs.current.get(selectedModel)?.current;
          if (group) {
            return {
              ...m,
              position: [
                group.position.x,
                group.position.y,
                group.position.z,
              ] as [number, number, number],
              rotation: [
                group.rotation.x,
                group.rotation.y,
                group.rotation.z,
              ] as [number, number, number],
              scale: [group.scale.x, group.scale.y, group.scale.z] as [
                number,
                number,
                number,
              ],
            };
          }
        }
        return m;
      }),
    );
  };

  // Export scene as image
  const exportImage = (): void => {
    if (glRef.current) {
      const link = document.createElement("a");
      link.download = "scene.png"; // Filename for the download
      link.href = glRef.current.domElement.toDataURL("image/png"); // Generate PNG data URL
      link.click(); // Trigger the download
    }
  };

  // Render
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [6, 5, 6], fov: 60 }}
        onPointerMissed={() => {
          setSelectedModel(null);
          setSelectedWall(null);
        }}
      >
        {/* Background */}
        <color
          attach="background"
          args={[dayNight === "day" ? "#ffffff" : "#111111"]}
        />

        {/* Lighting */}
        {dayNight === "day" ? (
          <>
            <ambientLight intensity={ambientIntensity} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          </>
        ) : (
          <pointLight
            position={pointPosition}
            intensity={pointIntensity}
            castShadow
          />
        )}

        {/* Controls */}
        {cameraMode === "orbit" ? (
          <OrbitControls enabled={!selectedModel} />
        ) : (
          <>
            <FPSCamera />
            <PointerLockControls />
          </>
        )}

        <PerspectiveCamera
          makeDefault={renderMode}
          position={[10, 10, 10]}
          fov={45}
          near={0.1}
          far={1000}
        />

        {renderMode && (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 15, 10]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-10, 5, -10]} intensity={0.6} />
          </>
        )}

        {/* Grid */}
        <Grid args={[50, 50]} />

        {/* Floor */}
        <Floor3D
          width={floor.width}
          height={floor.height}
          material={floor.material}
        />

        {/* Walls */}
        {wallsState.map((wall) => {
          const isHovered = hoveredWall === wall.id;
          const isSelected = selectedWall === wall.id;

          return (
            <Wall3D
              key={wall.id}
              wall={wall}
              highlighted={isHovered || isSelected}
              onClick={() => {
                setSelectedWall(wall.id);
                setSelectedModel(null);
              }}
              onHover={(hover: boolean) =>
                setHoveredWall(hover ? wall.id : null)
              }
            >
              {windows
                .filter((w) => w.wallId === wall.id)
                .map((w) => (
                  <Window3D
                    key={w.id}
                    wall={wall}
                    offset={w.offset}
                    width={w.width}
                    height={w.height}
                    sillHeight={w.sillHeight}
                  />
                ))}
            </Wall3D>
          );
        })}

        {/* Furniture */}
        {models.map((model) => {
          if (!modelRefs.current.has(model.id)) {
            modelRefs.current.set(model.id, React.createRef());
          }

          return (
            <Model
              key={model.id}
              ref={modelRefs.current.get(model.id)}
              url={model.url}
              position={model.position}
              scale={model.scale}
              rotation={model.rotation}
              onClick={() => {
                setSelectedModel(model.id);
                setSelectedWall(null);
              }}
            >
              {/* If this model should emit light */}
              {model.url.includes("lamp") && (
                <pointLight
                  intensity={10}
                  distance={5}
                  color="#ffffff"
                  position={[0, 1, 0]}
                  castShadow
                />
              )}
            </Model>
          );
        })}

        {/* Transform Controls */}
        {selectedModel && modelRefs.current.get(selectedModel)?.current && (
          <TransformControls
            ref={transformRef}
            object={modelRefs.current.get(selectedModel)!.current!}
            mode={transformMode}
            onObjectChange={() => {
              const obj = modelRefs.current.get(selectedModel!)?.current;
              if (obj) clampPosition(obj);
            }}
          />
        )}
      </Canvas>

      {/* ---------- UI TOOLBAR ---------- */}

      <div className="absolute top-32 left-6 z-10 flex gap-2">
        {/* Add furniture */}
        <FurnitureList onClick={addModel} />

        {/* Camera mode */}
        <Button
          onClick={() =>
            setCameraMode(cameraMode === "orbit" ? "fps" : "orbit")
          }
        >
          {cameraMode === "orbit" ? <FootprintsIcon /> : <OrbitIcon />}
        </Button>

        {/* Day / Night */}
        <Button
          onClick={() => setDayNight(dayNight === "day" ? "night" : "day")}
        >
          {dayNight === "day" ? <MoonIcon /> : <SunIcon />}
        </Button>

        <Button
          variant={renderMode ? "destructive" : "default"}
          onClick={() => setRenderMode(!renderMode)}
        >
          <CameraIcon />
        </Button>

        {/* Materials */}
        {selectedWall && <MaterialList onClick={handleChangeMaterial} />}

        {/* Transform buttons */}
        {selectedModel && (
          <>
            <Button onClick={() => setTransformMode("translate")}>
              <Move3DIcon />
            </Button>
            <Button onClick={() => setTransformMode("rotate")}>
              <Rotate3DIcon />
            </Button>
            <Button onClick={() => setTransformMode("scale")}>
              <Scale3DIcon />
            </Button>
            <Button onClick={duplicateModel}>
              <CopyIcon />
            </Button>
            <Button onClick={removeModel}>
              <TrashIcon />
            </Button>
          </>
        )}

        {renderMode && (
          <>
            <Button onClick={exportImage}>Export Image</Button>
          </>
        )}
      </div>

      {/* ---------- LIGHT PANEL ---------- */}

      <div className="absolute bottom-5 right-5 z-10 bg-white p-3 rounded shadow">
        <div className="flex flex-col gap-3">
          {dayNight === "day" && (
            <div className="space-y-3">
              <Label>Ambient Light Intensity</Label>
              <Slider
                value={[ambientIntensity]}
                onValueChange={(v) => setAmbientIntensity(v[0])}
                min={0}
                max={5}
                step={0.1}
              />
            </div>
          )}

          {dayNight === "night" && (
            <div className="space-y-3">
              <Label>Point Light Intensity</Label>
              <Slider
                value={[pointIntensity]}
                onValueChange={(v) => setPointIntensity(v[0])}
                min={0}
                max={50}
                step={1}
              />

              <Label>Point Light Position</Label>
              <div className="flex gap-2">
                {["X", "Y", "Z"].map((axis, i) => (
                  <Input
                    key={axis}
                    type="number"
                    value={pointPosition[i]}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      const arr = [...pointPosition] as [
                        number,
                        number,
                        number,
                      ];
                      arr[i] = v;
                      setPointPosition(arr);
                    }}
                    className="w-16"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- WALL COLOR PICKER ---------- */}

      {selectedWall && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow">
          <Label className="mb-2 block">Wall Color</Label>
          <HexColorPicker
            color={
              wallsState.find((w) => w.id === selectedWall)?.color || "#ffffff"
            }
            onChange={updateWallColor}
          />
          <Button className="mt-2" onClick={() => setSelectedWall(null)}>
            Close
          </Button>
        </div>
      )}

      {selectedModel && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow">
          <Label className="mb-2 block">Model Color</Label>
          <HexColorPicker
            color={
              models.find((m) => m.id === selectedModel)?.color || "#ffffff"
            }
            onChange={updateModelColor}
          />
          <Button className="mt-2" onClick={() => setSelectedModel(null)}>
            Close
          </Button>
        </div>
      )}
    </>
  );
}
