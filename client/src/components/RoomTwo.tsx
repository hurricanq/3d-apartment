import React from 'react';
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import floorPlan from "../data/floor-plan-two.json"

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

export default function RoomTwo() {
    return (
        <>
            {/* Render rooms */}
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
                        >
                            <planeGeometry args={[wall.dimensions.width, wall.dimensions.height]} />
                            <meshStandardMaterial color={wall.color} />
                        </mesh>
                    ))}
                </group>
            ))}
        </>
    );
}