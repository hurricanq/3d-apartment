"use client";

import React, { useState, useEffect, forwardRef } from 'react';
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
    const [hovered, setHovered] = useState(false)

    /*
    scene.traverse((obj: any) => {
        if (obj.isMesh) {
            obj.castShadow = true;
        }
    });

    useEffect(() => {
        scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh
                const mat = mesh.material as THREE.MeshStandardMaterial
                if (mat.color) {
                    mat.color.set(hovered ? '#ffcc00' : '#ffffff')
                }
            }
        })
    }, [hovered, scene])
    */

    // Update color based on hover
    useEffect(() => {
        scene.traverse((obj: any) => {
            if (obj.isMesh) {
                obj.castShadow = true;

                const mesh = obj
                const mat = mesh.material
                if (mat.color) {
                    mat.color.set(hovered ? '#00ff00' : '#ffffff')
                }
            }
        })
    }, [hovered, scene])

    return <primitive
                ref={ref}
                object={scene}
                onPointerDown={onClick}
                {...props}
                onPointerOver={(e: any) => {
                    e.stopPropagation()
                    setHovered(true)
                    document.body.style.cursor = 'pointer'
                }}
                onPointerOut={(e: any) => {
                    e.stopPropagation()
                    setHovered(false)
                    document.body.style.cursor = 'default'
                }} 
            />;
});

export default Model;
