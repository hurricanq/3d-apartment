// ApartmentThree.tsx - Changing wall colors, duplicate furniture items
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, useTexture, PointerLockControls } from '@react-three/drei';  // Added Box and Plane for walls/floor
import * as THREE from 'three';
import Model from '@/components/Model';
import FPSCamera from '@/components/FPSCamera';
import floorPlan from "@/data/floor-plan-two.json";

interface ModelData {
    id: number;
    url: string;
    position: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
}

interface WallData {
    id: string;
    position: [number, number, number];
    dimensions: { width: number; height: number; depth: number };
    color: string;  // Dynamic color
}

function Floor({ width, height }: { width: number; height: number }) {
    const woodTexture = useTexture("/textures/wood.jpg");
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(10, 10);

    return (
        <mesh
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial map={woodTexture} />
        </mesh>
    );
}

export default function ApartmentThree() {
    const [models, setModels] = useState<ModelData[]>([]);
    const [selected, setSelected] = useState<number | null>(null);  // For furniture
    const [selectedWall, setSelectedWall] = useState<string | null>(null);  // For walls
    const [wallColors, setWallColors] = useState<Record<string, string>>({});  // Map wall ID to color
    const [showColorPicker, setShowColorPicker] = useState(false);  // Toggle color list
    const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
    const transformRef = useRef<any>(null);
    const modelRefs = useRef(new Map<number, React.RefObject<THREE.Group | null>>());

    const [cameraMode, setCameraMode] = useState<"orbit" | "fps">("orbit");

    // Predefined color options
    const colorOptions = [
        { name: 'White', value: '#FFFFFF' },
        { name: 'Red', value: '#FF0000' },
        { name: 'Blue', value: '#0000FF' },
        { name: 'Green', value: '#00FF00' },
        { name: 'Yellow', value: '#FFFF00' },
        { name: 'Gray', value: '#808080' },
    ];

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
                initialWallColors[wall.id] = wall.color || '#FFFFFF';  // Default to white if not set
            });
        });
        setModels(loadedModels);
        setWallColors(initialWallColors);
    }, []);

    // Add a new model (WIP)
    const addModel = (): void => {
        const id = Date.now();
        const modelRef = React.createRef<THREE.Group>();
        modelRefs.current.set(id, modelRef);
        const newModel: ModelData = {
            id,
            url: '/models/bonsai_tree.glb',
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

    // Duplicate the selected model (WIP)
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

    // Handle wall selection
    const handleWallSelect = (wallId: string): void => {
        setSelectedWall(wallId);
        setSelected(null);  // Deselect furniture
        setShowColorPicker(false);  // Hide color picker on new selection
    };

    // Handle color change
    const changeWallColor = (color: string): void => {
        if (selectedWall) {
            setWallColors((prev) => ({ ...prev, [selectedWall]: color }));
            setShowColorPicker(false);  // Hide after selection
        }
    };

    // Handle model selection
    const handleSelect = (id: number): void => {
        setSelected(id);
        setSelectedWall(null);  // Deselect walls
    };

    // Handle deselection by clicking outside
    const handleDeselect = (): void => {
        setSelected(null);
        setSelectedWall(null);
        setShowColorPicker(false);
    };

    // Clamp position
    const clampPosition = (object: THREE.Object3D): void => {
        object.position.y = Math.max(0, object.position.y);
        object.position.x = Math.max(-5, Math.min(5, object.position.x));
        object.position.z = Math.max(-5, Math.min(5, object.position.z));
    };

    return (
        <div className="relative h-screen">
            <Canvas
                camera={{ position: [0, 1.6, 2], fov: 75 }}
                onPointerMissed={handleDeselect}
                shadows
            >
                <ambientLight intensity={1} />
                <directionalLight color="white" position={[1, 1, 0]} />

                {/* Old OrbitControls
                <OrbitControls enabled={!selected && !selectedWall} />
                */}

                <gridHelper args={[50, 100]} />

                {/* Render walls with dynamic colors */}
                {floorPlan.rooms.map((room) => (
                    <group key={room.id}>
                        {/* Floor */}
                        <Floor width={room.dimensions.width} height={room.dimensions.height} />
            
                        {/* Walls */}
                        {room.walls.map((wall) => (
                            <mesh
                                key={wall.id}
                                position={[wall.position[0], wall.position[1], wall.position[2]]}
                                rotation={(wall.rotation ?? [0, 0, 0]) as [number, number, number]}
                                onClick={() => handleWallSelect(wall.id)}
                            >
                                <planeGeometry args={[wall.dimensions.width, wall.dimensions.height]} />
                                <meshStandardMaterial color={wallColors[wall.id] || wall.color} />
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
                    />
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
                        enabled={!selected && !selectedWall}
                        enablePan={false}
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
            <div className="absolute top-5 left-5 z-10 flex gap-2">
                <button className="px-3 py-1 rounded bg-white shadow" onClick={addModel}>Add Furniture</button>
                <button className="px-3 py-1 rounded bg-white shadow" onClick={removeModel} disabled={!selected}>
                    Remove Selected
                </button>

                {/* Toggle camera mode */}
                <button
                    onClick={() => setCameraMode(cameraMode === "orbit" ? "fps" : "orbit")}
                    className="px-3 py-1 rounded bg-white shadow"
                >
                    Toggle: {cameraMode === "orbit" ? "FPS Walk" : "Orbit Look"}
                </button>

                {selected && (
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded bg-white shadow" onClick={() => setMode('translate')}>Translate</button>
                        <button className="px-3 py-1 rounded bg-white shadow" onClick={() => setMode('rotate')}>Rotate</button>
                        <button className="px-3 py-1 rounded bg-white shadow" onClick={() => setMode('scale')}>Scale</button>
                        <button className="px-3 py-1 rounded bg-white shadow" onClick={duplicateModel}>Duplicate</button>
                    </div>
                )}

                {/* Wall color change UI */}
                {selectedWall && (
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 rounded bg-white shadow"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        >
                            Change Color
                        </button>
                        {showColorPicker && (
                            <div className="flex gap-1">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        className="px-3 py-1 rounded border"
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => changeWallColor(color.value)}
                                        title={color.name}
                                    >
                                        {/* Optional: Add color name text if needed */}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
