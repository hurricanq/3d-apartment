"use client";

import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useParams } from 'next/navigation';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, useTexture, PointerLockControls } from '@react-three/drei';
import { SignedIn, SignedOut, RedirectToSignIn} from '@clerk/nextjs';

import Model from '@/components/Model3';
import FPSCamera from '@/components/FPSCamera';
import FurnitureList from '@/components/FurnitureList';

// Shadcn UI components & Lucide icons
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FootprintsIcon, OrbitIcon, SunIcon, MoonIcon, SaveIcon, Move3DIcon, Rotate3DIcon, Scale3DIcon, CopyIcon, TrashIcon } from "lucide-react";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchDesignById, updateDesign } from "@/lib/features/design/designSlice";

// Constants
import { NAVBAR_HEIGHT } from '@/lib/constants';

// Interfaces
interface ModelData {
    id: number;
    url: string;
    position: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
}

interface NewDesignData {
    models: ModelData[];
    rooms?: any[];
}

interface SelectedWall {
    roomId: number;
    wallId: number;
}

// Functions
function Floor({ material, position, width, height }: { material: string; position: [number, number, number]; width: number; height: number }) {
    const floorTexture = useTexture(`/textures/${material}.jpg`);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial map={floorTexture} />
        </mesh>
    );
}

export default function DesignPage() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { selectedDesign } = useSelector((state: RootState) => state.designs);

    // States for models and rooms
    const [models, setModels] = useState<ModelData[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);

    // States for selected furniture model and wall
    const [selectedModel, setSelectedModel] = useState<number | null>(null);
    const [selectedWall, setSelectedWall] = useState<SelectedWall | null>(null);
    const [hoveredWall, setHoveredWall] = useState<SelectedWall | null>(null);

    // UI states
    const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');    // Model manipulation
    const [cameraMode, setCameraMode] = useState<"orbit" | "fps">("orbit");             // Camera mode
    const [dayNightMode, setDayNightMode] = useState<"day" | "night">("day");           // Day/night mode

    // States for light controls
    const [ambientIntensity, setAmbientIntensity] = useState<number>(1);
    const [pointIntensity, setPointIntensity] = useState<number>(20);
    const [pointPosition, setPointPosition] = useState<[number, number, number]>([0, 2, 0]);

    // Refs
    const transformRef = useRef<any>(null);
    const modelRefs = useRef(new Map<number, React.RefObject<THREE.Group | null>>());

    // Fetch design by ID (on mount) from the backend
    useEffect(() => {
        dispatch(fetchDesignById(Number(id)));
    }, [id, dispatch]);

    // Load models and rooms from data of selectedDesign
    useEffect(() => {
        if (selectedDesign?.data?.models) {
            // Re-initialize modelRefs for the models being loaded
            const initialModels: ModelData[] = selectedDesign.data.models;
            const newModelRefs = new Map<number, React.RefObject<THREE.Group | null>>();
            
            initialModels.forEach(model => {
                newModelRefs.set(model.id, React.createRef<THREE.Group>());
            });

            // Set the component state
            setModels(initialModels);
            modelRefs.current = newModelRefs;
        }
        if (selectedDesign?.data?.rooms) {
            setRooms(selectedDesign.data.rooms); // Load rooms (from data) into the local state
        }
    }, [selectedDesign]);

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
                const id = Date.now();  // Unique ID
                const modelRef = React.createRef<THREE.Group>();
                modelRefs.current.set(id, modelRef);
                const duplicated: ModelData = {
                    id,
                    url: original.url,
                    position: [
                        original.position[0] + 0.5,  // Offset x by 0.5
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
    const handleModelSelect = (id: number): void => {
        setSelectedModel(id);
        setSelectedWall(null); // Deselect wall when selecting model
    };

    // Handle wall selection
    const handleWallSelect = (roomId: number, wallId: number): void => {
        setSelectedWall({ roomId, wallId });
        setSelectedModel(null); // Deselect furniture when selecting wall
    };

    // Handle deselection by clicking outside
    const handleDeselect = (): void => {
        setSelectedModel(null);
        setSelectedWall(null);
    };

    // Update wall color
    const updateWallColor = (color: string): void => {
        if (!selectedWall) return;
        setRooms(prevRooms =>
            prevRooms.map(room =>
                room.id === selectedWall.roomId
                    ? {
                        ...room,
                        walls: room.walls.map((wall: any) =>
                            wall.id === selectedWall.wallId
                                ? { ...wall, color }
                                : wall
                        )
                    }
                    : room
            )
        );
    };

    // Clamp position
    const clampPosition = (object: THREE.Object3D): void => {
        object.position.x = Math.max(-4, Math.min(4, object.position.x));
        object.position.y = Math.max(0, Math.min(2.5, object.position.y));
        object.position.z = Math.max(-4, Math.min(4, object.position.z));

        setModels(prevModels => 
            prevModels.map(m => {
                if (m.id === selectedModel) {
                    const group = modelRefs.current.get(selectedModel)?.current;
                    if (group) {
                        return {
                            ...m,
                            // These lines read the current Three.js values and update the state
                            position: [group.position.x, group.position.y, group.position.z] as [number, number, number],
                            rotation: [group.rotation.x, group.rotation.y, group.rotation.z] as [number, number, number],
                            scale: [group.scale.x, group.scale.y, group.scale.z] as [number, number, number],
                        };
                    }
                }
                return m;
            })
        );
    };

    // Save design (update the JSON data of the scene to the database)
    const saveDesign = () => {
        if (!selectedDesign || !id) {
            console.error("Cannot save: selectedDesign or ID is missing.");
            return;
        }

        // 1. Construct the new 'data' payload
        // This payload includes the current furniture models state,
        // and the updated room/wall data from local state.
        const newData: NewDesignData = {
            models: models,
            rooms: rooms // Use updated rooms from local state
        };

        // 2. Prepare the update DTO
        const updateData = {
            data: newData,
        };

        // 3. Dispatch the updateDesign thunk
        dispatch(updateDesign({
            id: Number(id),
            data: updateData,
        }))
        .unwrap()
        .then(() => {
            alert("Design saved successfully!");
        })
        .catch((error: any) => {
            alert("Failed to save design: " + error.message);
        });
    };

    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                <div className="relative h-screen" style={{ marginTop: `${-NAVBAR_HEIGHT}px` }}>
                    <Canvas
                        camera={{ position: [0, 1.6, 2], fov: 75 }}
                        onPointerMissed={handleDeselect}
                        shadows
                    >
                        <color attach="background" args={[dayNightMode === "day" ? "#FFFFFF" :"#111111"]} />

                        {/* Lighting (day/night) */}
                        {dayNightMode === "day" ? (
                            <group>
                                <ambientLight intensity={ambientIntensity} />
                                <directionalLight color="white" position={[1, 1, 0]} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                            </group>
                        ) : (
                            <pointLight position={pointPosition} intensity={pointIntensity} color="#fff" castShadow/>
                        )}

                        <gridHelper args={[50, 100]} />

                        {/* Render rooms */}
                        {rooms.map((room: any) => (
                            <group key={room.id}>
                                {/* Floors */}
                                {room.floors.map((floor: any) => (
                                    <Floor
                                        key={floor.id}
                                        material={floor.material}
                                        width={floor.dimensions.width}
                                        height={floor.dimensions.height}
                                        position={[floor.position.x, floor.position.y, floor.position.z]}
                                    />
                                ))}
                    
                                {/* Walls */}
                                {room.walls.map((wall: any) => {
                                    const isHovered = hoveredWall?.roomId === room.id && hoveredWall?.wallId === wall.id;
                                    return (
                                        <mesh
                                            key={wall.id}
                                            position={[wall.position.x, wall.position.y, wall.position.z]}
                                            rotation={[wall.rotation.x, wall.rotation.y, wall.rotation.z]}
                                            receiveShadow
                                            castShadow={false}
                                            onClick={() => handleWallSelect(room.id, wall.id)}
                                            onPointerOver={() => setHoveredWall({ roomId: room.id, wallId: wall.id })}
                                            onPointerOut={() => setHoveredWall(null)}
                                        >
                                            <boxGeometry args={[wall.dimensions.width, wall.dimensions.height, wall.dimensions.depth]} />
                                            <meshStandardMaterial
                                                color={wall.color}
                                                emissive={isHovered ? "#00FF00" : "#000000"} // Highlight with emissive glow
                                                emissiveIntensity={isHovered ? 1 : 0}
                                            />
                                        </mesh>
                                    );
                                })}
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
                                onClick={() => handleModelSelect(model.id)}
                            >
                                {/* If this model should emit light */}
                                {model.url.includes("lamp") && (
                                    <pointLight intensity={10} distance={5} color="#ffffff" position={[0, 1, 0]} castShadow />
                                )}
                            </Model>
                        ))}

                        {/* TransformControls for furniture only */}
                        {selectedModel && modelRefs.current.get(selectedModel)?.current && (
                            <TransformControls
                                ref={transformRef}
                                object={modelRefs.current.get(selectedModel)!.current!}
                                mode={mode}
                                onObjectChange={(e: any) => clampPosition(e.target.object)}
                            />
                        )}

                        {/* Camera: Orbit mode */}
                        {cameraMode === "orbit" ? (
                            <OrbitControls
                                enabled={!selectedModel}
                                enablePan={true}
                                enableRotate={true}
                                rotateSpeed={0.6}
                            />
                        ) : (
                            <>
                                <FPSCamera />         {/* WASD movement */}
                                <PointerLockControls />  {/* Mouse look */}
                            </>
                        )}
                    </Canvas>

                    {/* UI Buttons */}
                    <div 
                        className="absolute top-0 left-5 z-10 flex gap-2"
                        style={{ marginTop: `${NAVBAR_HEIGHT + 15}px` }}
                    >
                        {/* Add furniture */}
                        <FurnitureList onClick={addModel} />

                        {/* Toggle camera mode */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => setCameraMode(cameraMode === "orbit" ? "fps" : "orbit")}
                                >    
                                    {cameraMode === "orbit" ? <FootprintsIcon /> : <OrbitIcon />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {cameraMode === "orbit" ? <p>FPS Walk Mode</p> : <p>Orbit Mode</p>}
                            </TooltipContent>
                        </Tooltip>

                        {/* Toggle day/night mode */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => setDayNightMode(dayNightMode === "day" ? "night" : "day")}
                                >    
                                    {dayNightMode === "day" ? <MoonIcon /> : <SunIcon />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {dayNightMode === "day" ? <p>Night Mode</p> : <p>Day Mode</p>}
                            </TooltipContent>
                        </Tooltip>

                        {/* Save design */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={saveDesign}
                                >    
                                    <SaveIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Save Design</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        {selectedModel && (
                            <div className="flex gap-2">
                                <Button onClick={() => setMode('translate')}>
                                    <Move3DIcon />
                                </Button>
                                <Button onClick={() => setMode('rotate')}>
                                    <Rotate3DIcon />
                                </Button>
                                <Button onClick={() => setMode('scale')}>
                                    <Scale3DIcon />
                                </Button>
                                <Button onClick={duplicateModel}>
                                    <CopyIcon />
                                </Button>
                                <Button onClick={removeModel} disabled={!selectedModel}>
                                    <TrashIcon />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-2 bg-white rounded-sm px-3 py-2">
                        <div className="flex gap-5">
                            <div className="flex flex-col gap-3">
                                <Label>Ambient Light Intensity</Label>
                                <Slider
                                    value={[ambientIntensity]}
                                    onValueChange={(value) => setAmbientIntensity(value[0])}
                                    max={5}
                                    min={0}
                                    step={0.1}
                                    className="w-32"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label>Point Light Intensity</Label>
                                <Slider
                                    value={[pointIntensity]}
                                    onValueChange={(value) => setPointIntensity(value[0])}
                                    max={50}
                                    min={0}
                                    step={1}
                                    className="w-32"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Point Light Position</Label>
                                <div className="flex gap-2">
                                    <div className="flex gap-2">
                                        <Label>X</Label>
                                        <Input
                                            type="number"
                                            value={pointPosition[0]}
                                            onChange={(e) => setPointPosition([parseFloat(e.target.value) || 0, pointPosition[1], pointPosition[2]])}
                                            className="w-16"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Label>Y</Label>
                                        <Input
                                            type="number"
                                            value={pointPosition[1]}
                                            onChange={(e) => setPointPosition([pointPosition[0], parseFloat(e.target.value) || 0, pointPosition[2]])}
                                            className="w-16"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Wall Color Picker */}
                    {selectedWall && (
                        <div className="absolute right-5 top-2/3 transform -translate-y-1/2 z-50 bg-white p-4 rounded shadow-lg">
                            <Label className="block mb-2">Wall Color</Label>
                            <HexColorPicker
                                color={rooms.find(r => r.id === selectedWall.roomId)?.walls.find((w: any) => w.id === selectedWall.wallId)?.color || '#ffffff'}
                                onChange={updateWallColor}
                            />
                            <Button onClick={() => setSelectedWall(null)} className="mt-2">Close</Button>
                        </div>
                    )}
                </div>
            </SignedIn>
        </>
    );
}
