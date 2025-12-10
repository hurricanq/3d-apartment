"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, useTexture, PointerLockControls } from '@react-three/drei';
import { SignedIn, SignedOut, RedirectToSignIn, SignInWithMetamaskButton } from '@clerk/nextjs';

import Model from '@/components/Model3';
import FPSCamera from '@/components/FPSCamera';
import FurnitureList from '@/components/FurnitureList';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FootprintsIcon, OrbitIcon, SunIcon, MoonIcon, SaveIcon, Move3DIcon, Rotate3DIcon, Scale3DIcon, CopyIcon, TrashIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchDesignById, updateDesign } from "@/lib/features/design/designSlice";

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

function Floor({ material, position, width, height }: { material: string; position: [number, number, number]; width: number; height: number }) {
    const floorTexture = useTexture(`/textures/${material}.jpg`);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    return (
        <mesh
            position={position}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial map={floorTexture} />
        </mesh>
    );
}

export default function DesignPage() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { selectedDesign } = useSelector((state: RootState) => state.designs);

    const [models, setModels] = useState<ModelData[]>([]);
    const [selected, setSelected] = useState<number | null>(null);  // For furniture
    const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate'); // Toggle model manipulation
    const [cameraMode, setCameraMode] = useState<"orbit" | "fps">("orbit"); // Toggle camera mode
    const [dayNightMode, setDayNightMode] = useState<"day" | "night">("day"); // Toggle day/night (ambient and directional lighting)

    // States for light controls
    const [ambientIntensity, setAmbientIntensity] = useState<number>(1);
    const [pointIntensity, setPointIntensity] = useState<number>(20);
    const [pointPosition, setPointPosition] = useState<[number, number, number]>([0, 2, 0]);

    const transformRef = useRef<any>(null);
    const modelRefs = useRef(new Map<number, React.RefObject<THREE.Group | null>>());

    // Fetch design by ID from backend API
    useEffect(() => {
        dispatch(fetchDesignById(Number(id)));
    }, [id, dispatch]);

    // Load models from the database when selectedDesign is available
    useEffect(() => {
        if (selectedDesign && selectedDesign.data?.models) {
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
    const handleSelect = (id: number): void => {
        setSelected(id);
    };

    // Handle deselection by clicking outside
    const handleDeselect = (): void => {
        setSelected(null);
    };

    // Clamp position
    const clampPosition = (object: THREE.Object3D): void => {
        object.position.x = Math.max(-4, Math.min(4, object.position.x));
        object.position.y = Math.max(0, Math.min(2.5, object.position.y));
        object.position.z = Math.max(-4, Math.min(4, object.position.z));

        setModels(prevModels => 
            prevModels.map(m => {
                if (m.id === selected) {
                    const group = modelRefs.current.get(selected)?.current;
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
        // and preserves the existing room/wall data from selectedDesign.data.
        const newData: NewDesignData = {
            models: models,
            rooms: selectedDesign.data.rooms // Preserve existing room structure (walls, ceiling, etc.)
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
            // Optional: Provide feedback to the user on success
            console.log("Design saved successfully!");
            alert("Design saved successfully!");
        })
        .catch((error: any) => {
            // Optional: Handle errors and provide feedback
            console.error("Failed to save design:", error);
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
                        {dayNightMode === "day" && (
                            <group>
                                <ambientLight intensity={ambientIntensity} />
                                <directionalLight color="white" position={[1, 1, 0]} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                            </group>
                        )}
                        {dayNightMode === "night" && (
                            <pointLight position={pointPosition} intensity={pointIntensity} color="#fff" castShadow/>
                        )}

                        <gridHelper args={[50, 100]} />

                        {/* Render rooms */}
                        {selectedDesign?.data?.rooms?.map((room: any) => (
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
                                {room.walls.map((wall: any) => (
                                    <mesh
                                        key={wall.id}
                                        position={[wall.position.x, wall.position.y, wall.position.z]}
                                        rotation={[wall.rotation.x, wall.rotation.y, wall.rotation.z]}
                                        receiveShadow
                                        castShadow={false}
                                    >
                                        <boxGeometry args={[wall.dimensions.width, wall.dimensions.height, wall.dimensions.depth]} />
                                        <meshStandardMaterial color={wall.color} />
                                    </mesh>
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
                                        color="#ffffff"
                                        position={[0, 1, 0]}   // Based on model origin
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
                                enablePan={true}
                                enableRotate={true}
                                rotateSpeed={0.6}
                            />
                        )}

                        {/* Camera: FPS mode */}
                        {cameraMode === "fps" && (
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
                        
                        {selected && (
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
                                <Button onClick={removeModel} disabled={!selected}>
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
                </div>
            </SignedIn>
        </>
    );
}
