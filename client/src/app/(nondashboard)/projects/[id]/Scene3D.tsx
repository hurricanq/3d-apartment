"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  PointerLockControls,
  Grid,
  PerspectiveCamera,
} from "@react-three/drei";

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
  DownloadIcon,
} from "lucide-react";

import { Wall, Window, Door, Room, ModelData } from "./types";
import FurnitureList from "@/components/FurnitureList";
import MaterialList from "@/components/MaterialList";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import RoomFloor3D from "./RoomFloor3D";

interface Scene3DProps {
  rooms: Room[];
  walls: Wall[];
  windows: Window[];
  doors?: Door[];
  models?: ModelData[];
}

// Helper component to access canvas and renderer
const CanvasRenderer = ({
  onReady,
}: {
  onReady: (
    gl: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) => void;
}) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (gl && scene && camera) {
      onReady(gl, scene, camera);
    }
  }, [gl, scene, camera, onReady]);

  return null;
};

export default function Scene3D({
  rooms,
  walls,
  windows,
  doors = [],
  models = [],
}: Scene3DProps) {
  // Selection states
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [selectedDoor, setSelectedDoor] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
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
  const [objectIntensity, setObjectIntensity] = useState(1);

  // Refs
  const transformRef = useRef<TransformControlsImpl>(null);
  const modelRefs = useRef(
    new Map<number, React.RefObject<THREE.Group | null>>(),
  );
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [models3D, setModels3D] = useState<ModelData[]>(models);
  const [renderMode, setRenderMode] = useState(false);

  const [wallsState, setWallsState] = useState(walls);
  const [doorsState, setDoorsState] = useState(doors);
  const [windowsState, setWindowsState] = useState(windows);
  const [roomsState, setRoomsState] = useState(rooms);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input fields
      const active = document.activeElement;
      const isTyping =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement;

      if (isTyping) return;

      if (e.key === "Delete" && selectedModel) {
        removeModel();
      }

      if (!selectedModel) return;

      switch (e.key.toLowerCase()) {
        case "t":
          setTransformMode("translate");
          break;
        case "r":
          setTransformMode("rotate");
          break;
        case "e":
          setTransformMode("scale");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedModel, models3D]);

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
    setModels3D([...models3D, newModel]);
  };

  // Remove the selected model
  const removeModel = (): void => {
    if (selectedModel) {
      modelRefs.current.delete(selectedModel);
      setModels3D(models3D.filter((m) => m.id !== selectedModel));
      setSelectedModel(null);
    }
  };

  // Duplicate the selected model
  const duplicateModel = (): void => {
    if (selectedModel) {
      const original = models3D.find((m) => m.id === selectedModel);
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
        setModels3D([...models3D, duplicated]);
      }
    }
  };

  const updateFloorMaterial = (material: string) => {
    if (!selectedRoom) return;

    setRoomsState((prev) =>
      prev.map((room) =>
        room.id === selectedRoom ? { ...room, material } : room,
      ),
    );
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

  const updateDoorColor = (color: string): void => {
    if (!selectedDoor) return;
    setDoorsState((prevDoors) =>
      prevDoors.map((door) =>
        door.id === selectedDoor ? { ...door, color } : door,
      ),
    );
  };

  const updateWindowColor = (color: string): void => {
    if (!selectedWindow) return;
    setWindowsState((prevWindows) =>
      prevWindows.map((window) =>
        window.id === selectedWindow ? { ...window, color } : window,
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

    setModels3D((prev) =>
      prev.map((m) => (m.id === selectedModel ? { ...m, color } : m)),
    );
  };

  const clampPosition = (object: THREE.Object3D): void => {
    object.position.x = Math.max(0, Math.min(8, object.position.x));
    object.position.y = Math.max(0, Math.min(2.5, object.position.y));
    object.position.z = Math.max(0, Math.min(6, object.position.z));

    setModels3D((prevModels) =>
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
  const exportImage = useCallback(async (): Promise<void> => {
    if (!glRef.current || !sceneRef.current || !cameraRef.current) {
      console.error("Renderer, scene, or camera not ready");
      alert("Renderer not ready. Please wait for the scene to load.");
      return;
    }

    try {
      const gl = glRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const canvas = gl.domElement;

      // Ensure canvas is fully rendered
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Render the scene with proper arguments
      gl.render(scene, camera);

      // Convert canvas to data URL
      const dataURL = canvas.toDataURL("image/png");

      // Create download link
      const link = document.createElement("a");
      link.download = `scene-${Date.now()}.png`;
      link.href = dataURL;
      link.click();

      console.log("Image exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export image");
    }
  }, []);

  // Render
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [6, 5, 6], fov: 60 }}
        onPointerMissed={() => {
          setSelectedModel(null);
          setSelectedWall(null);
          setSelectedDoor(null);
          setSelectedWindow(null);
        }}
        onCreated={(state) => {
          glRef.current = state.gl;
          canvasRef.current = state.gl.domElement;
        }} // For exporting image
      >
        {/* Canvas Renderer Helper */}
        <CanvasRenderer
          onReady={(gl, scene, camera) => {
            glRef.current = gl;
            sceneRef.current = scene;
            cameraRef.current = camera;
          }}
        />

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
        {roomsState.map((room) => (
          <RoomFloor3D
            key={room.id}
            polygon={room.polygon}
            material={room.material || "Maple"}
            highlighted={hoveredRoom === room.id}
          />
        ))}

        {/* Walls */}
        {wallsState.map((wall) => {
          const isHovered = hoveredWall === wall.id;
          const isSelected = selectedWall === wall.id;

          const wallWindows = windowsState.filter((w) => w.wallId === wall.id);
          const wallDoors = doorsState.filter((d) => d.wallId === wall.id);

          return (
            <Wall3D
              key={wall.id}
              wall={wall}
              windows={wallWindows}
              doors={wallDoors}
              highlighted={isHovered || isSelected}
              onClick={() => {
                setSelectedWall(wall.id);
                setSelectedModel(null);
                setSelectedDoor(null);
                setSelectedWindow(null);
              }}
              onHover={(hover: boolean) =>
                setHoveredWall(hover ? wall.id : null)
              }
              onDoorClick={(doorId) => {
                setSelectedDoor(doorId);
                setSelectedModel(null);
                setSelectedWall(null);
                setSelectedWindow(null);
                // Toggle door open/close
                setDoorsState((prevDoors) =>
                  prevDoors.map((door) =>
                    door.id === doorId
                      ? { ...door, isOpen: !door.isOpen }
                      : door,
                  ),
                );
              }}
              onWindowClick={(windowId) => {
                setSelectedWindow(windowId);
                setSelectedModel(null);
                setSelectedWall(null);
                setSelectedDoor(null);
              }}
            />
          );
        })}

        {/* Furniture */}
        {models3D.map((model) => {
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
                setSelectedDoor(null);
                setSelectedWindow(null);
              }}
            >
              {/* If this model should emit light */}
              {model.url.includes("lamp") ||
                (model.url.includes("light") && (
                  <pointLight
                    intensity={objectIntensity}
                    distance={5}
                    color="#ffffff"
                    position={[0, 1, 0]}
                    castShadow
                  />
                ))}
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
        <FurnitureList
          onClick={addModel}
          onAdd={() => {
            // future extension (analytics, toast, etc.)
          }}
        />

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
            <Button onClick={exportImage}>
              {" "}
              <DownloadIcon />
            </Button>
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

          <div className="space-y-3">
            <Label>Object Light Intensity</Label>
            <Slider
              value={[objectIntensity]}
              onValueChange={(v) => setObjectIntensity(v[0])}
              min={0}
              max={20}
              step={0.1}
            />
          </div>

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

      <div className="absolute top-32 right-6 z-10 bg-white p-4 rounded shadow w-64">
        <Label className="mb-3 block font-semibold">Rooms</Label>

        <div className="flex flex-col gap-2">
          {roomsState.map((room, index) => (
            <div
              key={room.id}
              className="flex items-center justify-between border p-2 rounded"
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              <span>Room {index + 1}</span>

              <Button size="sm" onClick={() => setSelectedRoom(room.id)}>
                Material
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 left-5 text-xs text-gray-500">
        T: Move | R: Rotate | E: Scale | Delete: Remove
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

      {selectedDoor && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow">
          <Label className="mb-2 block">Door Color</Label>
          <HexColorPicker
            color={
              doorsState.find((d) => d.id === selectedDoor)?.color || "#8b5a2b"
            }
            onChange={updateDoorColor}
          />
          <Button className="mt-2" onClick={() => setSelectedDoor(null)}>
            Close
          </Button>
        </div>
      )}

      {selectedWindow && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow">
          <Label className="mb-2 block">Window Color</Label>
          <HexColorPicker
            color={
              windowsState.find((w) => w.id === selectedWindow)?.color ||
              "#88ccff"
            }
            onChange={updateWindowColor}
          />
          <Button className="mt-2" onClick={() => setSelectedWindow(null)}>
            Close
          </Button>
        </div>
      )}

      {selectedModel && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow">
          <Label className="mb-2 block">Model Color</Label>
          <HexColorPicker
            color={
              models3D.find((m) => m.id === selectedModel)?.color || "#ffffff"
            }
            onChange={updateModelColor}
          />
          <Button className="mt-2" onClick={() => setSelectedModel(null)}>
            Close
          </Button>
        </div>
      )}

      {selectedRoom && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow">
          <Label className="mb-2 block">Floor Material</Label>

          <MaterialList onClick={updateFloorMaterial} />

          <Button className="mt-2" onClick={() => setSelectedRoom(null)}>
            Close
          </Button>
        </div>
      )}
    </>
  );
}
