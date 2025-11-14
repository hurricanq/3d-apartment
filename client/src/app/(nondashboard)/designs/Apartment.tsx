import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import Room from '@/components/Room';
import Model from '@/components/Model';

interface ModelData {
    id: number;
    url: string;
    position: [number, number, number];
}

export default function Apartment() {
    const [models, setModels] = useState<ModelData[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
    const transformRef = useRef<typeof TransformControls>(null);
    const modelRefs = useRef(new Map<number, React.RefObject<THREE.Group>>());

    // Add a new model
    const addModel = (): void => {
        const id = Date.now();
        const modelRef = React.createRef<THREE.Group>();
        modelRefs.current.set(id, modelRef);
        const newModel: ModelData = {
            id,
            url: '/models/gaming_chair.glb',
            position: [0, 0, 0],
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
            >
                <color attach="background" args={['lightblue']} />
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} />

                <OrbitControls enabled={!selected} />

                <gridHelper args={[50, 100]} />
                <Room />

                {models.map((model) => (
                    <Model
                        key={model.id}
                        ref={modelRefs.current.get(model.id)}
                        url={model.url}
                        position={model.position}
                        onClick={() => handleSelect(model.id)}
                    />
                ))}
                {selected && (
                    <TransformControls
                        ref={transformRef}
                        object={modelRefs.current.get(selected)?.current}
                        mode={mode}
                        onObjectChange={(e) => clampPosition(e.target.object)}
                    />
                )}
            </Canvas>

            {/* UI Buttons */}
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
