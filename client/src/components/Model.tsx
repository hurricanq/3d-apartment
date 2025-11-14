import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
    url: string;
    onClick: () => void;
    position?: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
}

const Model = forwardRef<THREE.Group, ModelProps>(({ url, onClick, ...props }, ref) => {
    const { scene } = useGLTF(url);
    return <primitive ref={ref} object={scene} onPointerDown={onClick} {...props} />;
});

export default Model;
