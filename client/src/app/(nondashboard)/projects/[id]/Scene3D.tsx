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
import Ceiling3D from "./Ceiling3D";

import { Button } from "@/components/ui/button";
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
  X,
} from "lucide-react";

import { Wall, Window, Door, Room, ModelData } from "./types";
import FurnitureList from "@/components/FurnitureList";
import MaterialList from "@/components/MaterialList";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import RoomFloor3D from "./RoomFloor3D";
import RoomsList from "@/components/RoomsList";
import LightPanel from "@/components/LightPanel";
import Hotkeys from "@/components/Hotkeys";
import { Input } from "@/components/ui/input";
import { useSelection } from "./_hooks/useSelection";
import { useTransform } from "./_hooks/useTransform";

interface Scene3DProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  walls: Wall[];
  setWalls: React.Dispatch<React.SetStateAction<Wall[]>>;
  windows: Window[];
  setWindows: React.Dispatch<React.SetStateAction<Window[]>>;
  doors?: Door[];
  setDoors: React.Dispatch<React.SetStateAction<Door[]>>;
  models?: ModelData[];
  setModels?: React.Dispatch<React.SetStateAction<ModelData[]>>;
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
  setRooms,
  walls,
  setWalls,
  windows,
  setWindows,
  doors = [],
  setDoors,
  models = [],
  setModels,
}: Scene3DProps) {
  // Refs
  const transformRef = useRef<TransformControlsImpl>(null);
  const modelRefs = useRef(
    new Map<number, React.RefObject<THREE.Group | null>>(),
  );
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const models3D = models;
  const setModels3D = setModels!;

  const {
    selectedModel,
    selectedWall,
    selectedDoor,
    selectedWindow,
    selectedRoom,
    hoveredWall,
    hoveredRoom,
    setSelectedModel,
    setSelectedWall,
    setSelectedDoor,
    setSelectedWindow,
    setSelectedRoom,
    setHoveredWall,
    setHoveredRoom,
    selectModel,
    selectWall,
    selectDoor,
    selectWindow,
    clearSelection,
  } = useSelection();

  const { clampObject, syncModelState, handleKeyTransform } = useTransform(
    selectedModel,
    modelRefs,
    setModels3D,
    walls,
  );

  // Keyboard controls
  useEffect(() => {
    window.addEventListener("keydown", handleKeyTransform);
    return () => window.removeEventListener("keydown", handleKeyTransform);
  }, [handleKeyTransform]);

  useEffect(() => {
    models3D.forEach((model) => {
      if (!modelRefs.current.has(model.id)) {
        modelRefs.current.set(model.id, React.createRef());
      }
    });

    // Cleanup removed models
    modelRefs.current.forEach((_, key) => {
      if (!models3D.find((m) => m.id === key)) {
        modelRefs.current.delete(key);
      }
    });
  }, [models3D]);

  // UI modes
  const [cameraMode, setCameraMode] = useState<"orbit" | "fps">("orbit");
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");

  const [dayNight, setDayNight] = useState<"day" | "night">("day");

  // Light controls
  const [ambientIntensity, setAmbientIntensity] = useState(1);
  const [objectIntensity, setObjectIntensity] = useState(1);

  const [renderMode, setRenderMode] = useState(false);

  const wallsState = walls;
  const setWallsState = setWalls;
  const doorsState = doors;
  const setDoorsState = setDoors;
  const windowsState = windows;
  const setWindowsState = setWindows;
  const roomsState = rooms;
  const setRoomsState = setRooms;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement;

      if (isTyping) return;

      if (selectedModel == null) return;

      const group = modelRefs.current.get(selectedModel)?.current;
      if (!group) return;

      switch (e.key.toLowerCase()) {
        // Delete model
        case "delete":
          removeModel();
          break;

        // Transform mode keys
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

      // Sync back to state
      setModels3D((prev) =>
        prev.map((m) =>
          m.id === selectedModel
            ? {
                ...m,
                position: [
                  group.position.x,
                  group.position.y,
                  group.position.z,
                ],
                rotation: [
                  group.rotation.x,
                  group.rotation.y,
                  group.rotation.z,
                ],
                scale: [group.scale.x, group.scale.y, group.scale.z],
              }
            : m,
        ),
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModel]);

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
        onPointerMissed={clearSelection}
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
          <></>
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
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
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

        {/* Ceiling */}
        {roomsState.map((room) => (
          <Ceiling3D
            key={`ceiling-${room.id}`}
            polygon={room.polygon}
            wallHeight={wallsState[0]?.dimensions?.height || 3}
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
              onClick={() => selectWall(wall.id)}
              onHover={(hover: boolean) =>
                setHoveredWall(hover ? wall.id : null)
              }
              onDoorClick={(doorId) => {
                selectDoor(doorId);
                // Toggle door open/close
                setDoorsState((prevDoors) =>
                  prevDoors.map((door) =>
                    door.id === doorId
                      ? { ...door, isOpen: !door.isOpen }
                      : door,
                  ),
                );
              }}
              onWindowClick={(windowId) => selectWindow(windowId)}
            />
          );
        })}

        {/* Furniture */}
        {models3D.map((model) => {
          return (
            <Model
              key={model.id}
              ref={modelRefs.current.get(model.id)}
              url={model.url}
              position={model.position}
              scale={model.scale}
              rotation={model.rotation}
              onClick={() => selectModel(model.id)}
            >
              {/* If this model should emit light */}
              {model.url.includes("lamp") ||
                (model.url.includes("light") && (
                  <pointLight
                    intensity={objectIntensity}
                    distance={20} // increase range
                    decay={2} // physically correct falloff
                    color="#ffffff"
                    position={[0, 1, 0]}
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
            onMouseUp={() => {
              const obj = modelRefs.current.get(selectedModel!)?.current;
              if (obj) {
                clampObject(obj); // keep constraints
                syncModelState(obj); // update ONCE
              }
            }}
          />
        )}
      </Canvas>

      {/* Left UIs */}
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
      </div>

      {/* Top Right UIs */}
      <div className="absolute top-18 right-6 z-10 flex gap-2">
        {/* Rooms List */}
        <RoomsList
          rooms={roomsState}
          selectedRoom={selectedRoom}
          onHover={(id) => setHoveredRoom(id)}
          onLeave={() => setHoveredRoom(null)}
          onSelect={(id) => setSelectedRoom(id)}
          onChangeMaterial={updateFloorMaterial}
          onClose={() => setSelectedRoom(null)}
        />

        {/* Light Panel */}
        <LightPanel
          dayNight={dayNight}
          ambientIntensity={ambientIntensity}
          objectIntensity={objectIntensity}
          onAmbientChange={(v) => setAmbientIntensity(v[0])}
          onObjectChange={(v) => setObjectIntensity(v[0])}
        />

        {/* Export Image Button */}
        <div className="flex flex-col space-y-2">
          <Button
            variant={renderMode ? "destructive" : "default"}
            onClick={() => setRenderMode(!renderMode)}
          >
            <CameraIcon />
          </Button>

          {renderMode && (
            <Button onClick={exportImage}>
              {" "}
              <DownloadIcon />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Right UIs */}
      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        <Hotkeys />
      </div>

      {/* Element Panel */}
      {selectedWall && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Label>Wall Color</Label>

            <Button onClick={() => setSelectedWall(null)}>
              <X />
            </Button>
          </div>

          <HexColorPicker
            color={
              wallsState.find((w) => w.id === selectedWall)?.color || "#ffffff"
            }
            onChange={updateWallColor}
          />

          {/* Hex Input */}
          <Input
            value={
              wallsState.find((w) => w.id === selectedWall)?.color || "#ffffff"
            }
            onChange={(e) => {
              let value = e.target.value;

              // Ensure it starts with #
              if (!value.startsWith("#")) value = "#" + value;

              // Optional: basic validation (only allow hex format)
              if (/^#([0-9A-Fa-f]{0,6})$/.test(value)) {
                updateWallColor(value);
              }
            }}
            placeholder="#ffffff"
          />
        </div>
      )}

      {selectedDoor && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Label>Door Color</Label>

            <Button onClick={() => setSelectedDoor(null)}>
              <X />
            </Button>
          </div>

          <HexColorPicker
            color={
              doorsState.find((d) => d.id === selectedDoor)?.color || "#8b5a2b"
            }
            onChange={updateDoorColor}
          />

          {/* Hex Input */}
          <Input
            value={
              doorsState.find((d) => d.id === selectedDoor)?.color || "#ffffff"
            }
            onChange={(e) => {
              let value = e.target.value;

              // Ensure it starts with #
              if (!value.startsWith("#")) value = "#" + value;

              // Optional: basic validation (only allow hex format)
              if (/^#([0-9A-Fa-f]{0,6})$/.test(value)) {
                updateDoorColor(value);
              }
            }}
            placeholder="#ffffff"
          />

          <Button onClick={() => setSelectedDoor(null)}>Close</Button>
        </div>
      )}

      {selectedWindow && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Label>Window Color</Label>

            <Button onClick={() => setSelectedWindow(null)}>
              <X />
            </Button>
          </div>

          <HexColorPicker
            color={
              windowsState.find((w) => w.id === selectedWindow)?.color ||
              "#88ccff"
            }
            onChange={updateWindowColor}
          />

          {/* Hex Input */}
          <Input
            value={
              windowsState.find((w) => w.id === selectedWindow)?.color ||
              "#ffffff"
            }
            onChange={(e) => {
              let value = e.target.value;

              // Ensure it starts with #
              if (!value.startsWith("#")) value = "#" + value;

              // Optional: basic validation (only allow hex format)
              if (/^#([0-9A-Fa-f]{0,6})$/.test(value)) {
                updateWindowColor(value);
              }
            }}
            placeholder="#ffffff"
          />
        </div>
      )}

      {selectedModel && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Label>Model Color</Label>

            <Button onClick={() => setSelectedModel(null)}>
              <X />
            </Button>
          </div>

          <HexColorPicker
            color={
              models3D.find((m) => m.id === selectedModel)?.color || "#ffffff"
            }
            onChange={updateModelColor}
          />

          {/* Hex Input */}
          <Input
            value={
              models3D.find((m) => m.id === selectedModel)?.color || "#ffffff"
            }
            onChange={(e) => {
              let value = e.target.value;

              // Ensure it starts with #
              if (!value.startsWith("#")) value = "#" + value;

              // Optional: basic validation (only allow hex format)
              if (/^#([0-9A-Fa-f]{0,6})$/.test(value)) {
                updateModelColor(value);
              }
            }}
            placeholder="#ffffff"
          />

          {/* Position Inputs */}
          <Label className="mb-2 block">Position</Label>
          <div className="flex gap-2">
            {["X", "Y", "Z"].map((axis, i) => {
              const model = models3D.find((m) => m.id === selectedModel);

              return (
                <Input
                  key={`pos-${axis}`}
                  type="number"
                  value={model ? model.position[i].toFixed(1) : 0}
                  step={0.1}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;

                    const group = modelRefs.current.get(
                      selectedModel!,
                    )?.current;
                    if (!group) return;

                    if (i === 0) group.position.x = val;
                    if (i === 1) group.position.y = val;
                    if (i === 2) group.position.z = val;

                    clampObject(group); // keep constraints + sync state
                  }}
                  className="w-16"
                />
              );
            })}
          </div>

          {/* Rotation Inputs */}
          <Label className="mb-2 block">Model Rotation in °</Label>
          <div className="flex gap-2">
            {["X", "Y", "Z"].map((axis, i) => {
              const model = models3D.find((m) => m.id === selectedModel);

              return (
                <Input
                  key={axis}
                  type="number"
                  value={
                    model?.rotation
                      ? Math.round(THREE.MathUtils.radToDeg(model.rotation[i]))
                      : 0
                  }
                  onChange={(e) => {
                    const deg = parseFloat(e.target.value) || 0;
                    const rad = THREE.MathUtils.degToRad(deg);

                    const group = modelRefs.current.get(selectedModel)?.current;
                    if (!group) return;

                    if (i === 0) group.rotation.x = rad;
                    if (i === 1) group.rotation.y = rad;
                    if (i === 2) group.rotation.z = rad;

                    setModels3D((prev) =>
                      prev.map((m) =>
                        m.id === selectedModel
                          ? {
                              ...m,
                              rotation: [
                                group.rotation.x,
                                group.rotation.y,
                                group.rotation.z,
                              ],
                            }
                          : m,
                      ),
                    );
                  }}
                  className="w-16"
                />
              );
            })}
          </div>

          {/* Scale Inputs */}
          <Label className="mb-2 block">Scale</Label>
          <div className="flex gap-2">
            {["X", "Y", "Z"].map((axis, i) => {
              const model = models3D.find((m) => m.id === selectedModel);

              return (
                <Input
                  key={`scale-${axis}`}
                  type="number"
                  value={model && model.scale ? model.scale[i].toFixed(1) : 1}
                  step={0.1}
                  min={0.1}
                  onChange={(e) => {
                    const val = Math.max(0.1, parseFloat(e.target.value) || 1);

                    const group = modelRefs.current.get(
                      selectedModel!,
                    )?.current;
                    if (!group) return;

                    if (i === 0) group.scale.x = val;
                    if (i === 1) group.scale.y = val;
                    if (i === 2) group.scale.z = val;

                    // sync state
                    setModels3D((prev) =>
                      prev.map((m) =>
                        m.id === selectedModel
                          ? {
                              ...m,
                              scale: [
                                group.scale.x,
                                group.scale.y,
                                group.scale.z,
                              ],
                            }
                          : m,
                      ),
                    );
                  }}
                  className="w-16"
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
