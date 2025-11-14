import React from 'react';
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function Floor() {
    const woodTexture = useTexture("/textures/wood.jpg");
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(10, 10);

    return (
        <mesh
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial map={woodTexture} />
        </mesh>
    );
}

export default function Room() {
    return (
        <>
            {/* Floor */}
            <Floor />

            {/* Back wall */}
            <mesh position={[0, 2.5, -5]}>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Front wall */}
            <mesh position={[0, 2.5, 5]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Left wall */}
            <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="white" />
            </mesh>
            
            {/* Right wall */}
            <mesh position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </>
    );
}