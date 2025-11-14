import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import RoomTwo from '@/components/RoomTwo';
import Model from '@/components/Model';  // Assuming this is updated to support scale/rotation

import floorPlan from "@/data/floor-plan-two.json";

interface ModelData {
    id: number;
    url: string;
    position: [number, number, number];
    scale?: [number, number, number];  // Add if not present
    rotation?: [number, number, number];  // Add if not present
}

export default function ApartmentTwo() {
    const [models, setModels] = useState<ModelData[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
    const transformRef = useRef<any>(null);
    const modelRefs = useRef(new Map<number, React.RefObject<THREE.Group | null>>());

    // Load furniture from JSON on mount
    useEffect(() => {
        const loadedModels: ModelData[] = [];
        floorPlan.rooms.forEach((room: any) => {
            room.furniture.forEach((item: any) => {
                const modelRef = React.createRef<THREE.Group>();
                modelRefs.current.set(item.id, modelRef);
                loadedModels.push({
                    id: item.id,
                    url: item.model,  // e.g., "/models/sofa.glb"
                    position: item.position,
                    scale: item.scale || [1, 1, 1],
                    rotation: item.rotation || [0, 0, 0],
                });
            });
        });
        setModels(loadedModels);
    }, []);

    // Add a new model
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

    // Handle model selection
    const handleSelect = (id: number): void => {
        setSelected(id);
    };

    // Handle deselection by clicking outside
    const handleDeselect = (): void => {
        setSelected(null);
    };

    // Clamp position to prevent clipping through floor and walls
    const clampPosition = (object: THREE.Object3D): void => {
        object.position.y = Math.max(0, object.position.y); // Floor at y=0
        object.position.x = Math.max(-5, Math.min(5, object.position.x)); // Walls at x=±5
        object.position.z = Math.max(-5, Math.min(5, object.position.z)); // Walls at z=±5
    };

    return (
        <div className="relative h-screen">
            <Canvas
                camera={{ position: [0, 5, 10] }}
                onPointerMissed={handleDeselect} // Deselect furniture on click outside
                shadows
            >
                <color attach="background" args={['lightblue']} />
                <ambientLight intensity={1} />
                <directionalLight color="white" position={[1, 1, 0]} />

                <OrbitControls enabled={!selected} />

                <gridHelper args={[50, 100]} />
                <RoomTwo />

                {models.map((model) => (
                    <Model
                        key={model.id}
                        ref={modelRefs.current.get(model.id)}
                        url={model.url}
                        position={model.position}
                        scale={model.scale}  // Pass scale if Model supports it
                        rotation={model.rotation}  // Pass rotation if Model supports it
                        onClick={() => handleSelect(model.id)}
                    />
                ))}
                {selected && modelRefs.current.get(selected)?.current && (
                    <TransformControls
                        ref={transformRef}
                        object={modelRefs.current.get(selected)!.current!}
                        mode={mode}
                        onObjectChange={(e: any) => clampPosition(e.target.object)}
                    />
                )}
            </Canvas>

            {/* UI Buttons (existing functionality) */}
            <div className="absolute top-5 left-5 z-10 flex gap-2">
                <button className="px-3 py-1 rounded bg-white shadow" onClick={addModel}>Add Furniture</button>
                <button className="px-3 py-1 rounded bg-white shadow" onClick={removeModel} disabled={!selected}>
                    Remove Selected
                </button>

                {selected && (
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded bg-white shadow" onClick={() => setMode('translate')}>Translate</button>
                        <button className="px-3 py-1 rounded bg-white shadow" onClick={() => setMode('rotate')}>Rotate</button>
                        <button className="px-3 py-1 rounded bg-white shadow" onClick={() => setMode('scale')}>Scale</button>
                    </div>
                )}
            </div>
        </div>
    );
}
