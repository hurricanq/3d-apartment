"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function RoomRenderer({ data }: { data: any }) {
    const rooms = data?.rooms ?? [];

    return (
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            <OrbitControls />

            {rooms.map((room: any) => (
                <Room key={room.id} room={room} />
            ))}
        </Canvas>
    );
}

function Room({ room }: { room: any }) {
    return (
        <group position={room.position}>
            {/* Floor */}
            {room.floor && (
                <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                    <boxGeometry
                        args={[
                            room.dimensions.width,
                            room.dimensions.depth,
                            0.1,
                        ]}
                    />
                    <meshStandardMaterial color={room.floor.color ?? "gray"} />
                </mesh>
            )}

            {/* Ceiling */}
            {room.ceiling && (
                <mesh
                    position={room.ceiling.position}
                    rotation={room.ceiling.rotation}
                >
                    <boxGeometry
                        args={[
                            room.ceiling.dimensions.width,
                            room.ceiling.dimensions.depth,
                            room.ceiling.dimensions.height,
                        ]}
                    />
                    <meshStandardMaterial color={room.ceiling.color ?? "white"} />
                </mesh>
            )}

            {/* Walls */}
            {room.walls?.map((wall: any) => (
                <mesh
                    key={wall.id}
                    position={wall.position}
                    rotation={wall.rotation}
                >
                    <boxGeometry
                        args={[
                            wall.dimensions.width,
                            wall.dimensions.height,
                            wall.dimensions.depth,
                        ]}
                    />
                    <meshStandardMaterial color={wall.color ?? "white"} />
                </mesh>
            ))}
        </group>
    );
}
