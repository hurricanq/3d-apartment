'use client'

import { useGLTF } from '@react-three/drei'
import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'

export default function InteractiveChair() {
    const { scene } = useGLTF('/models/gaming_chair.glb')
    const [hovered, setHovered] = useState(false)

    // Clone materials safely
    useEffect(() => {
        scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh
                mesh.material = (mesh.material as THREE.Material).clone()
            }
        })
    }, [scene])

    // Update color based on hover
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

    return (
        <primitive
            object={scene}
            position={[0, -0.5, 0]}
            scale={0.002}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation()
                setHovered(true)
                document.body.style.cursor = 'pointer'
            }}
            onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation()
                setHovered(false)
                document.body.style.cursor = 'default'
            }}
        />
    )
}
