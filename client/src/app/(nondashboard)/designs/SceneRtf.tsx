import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';

function Earth() {
    const texture = useTexture('/earth.jpg')

    return (
        <mesh>
            <sphereGeometry />
            <meshStandardMaterial map={texture} />
        </mesh>
    )
}

const SceneRtf = () => {
    return (
        <div className="w-screen h-screen">
            <Canvas
                camera={{ position: [0, 0, 5] }}
            >
                {/* Lighting */}
                <directionalLight color="white" position={[1, 1, 0]} />

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                    <planeGeometry args={[10, 10]} />
                    <meshStandardMaterial />
                </mesh>

                <Earth />

                {/* Orbit controls */}
                <OrbitControls />
            </Canvas>
        </div>
    )
}

export default SceneRtf
