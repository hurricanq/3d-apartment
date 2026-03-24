"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useMemo,
  ReactNode,
} from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  url: string;
  onClick: () => void;
  children?: ReactNode;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

const Model = forwardRef<THREE.Group, ModelProps>(
  ({ url, onClick, children, ...props }, ref) => {
    const gltf = useGLTF(url);

    // Clone scene AND clone all materials
    const clonedScene = useMemo(() => {
      const clone = gltf.scene.clone(true);

      clone.traverse((obj: THREE.Object3D) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.material = (mesh.material as THREE.Material).clone();
          mesh.castShadow = true;
        }
      });

      return clone;
    }, [gltf]);

    const [hovered, setHovered] = useState(false);

    useEffect(() => {
      clonedScene.traverse((obj: THREE.Object3D) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;

          if (material.color) {
            material.color.set(hovered ? "#00ff00" : "#ffffff");
          }
        }
      });
    }, [hovered, clonedScene]);

    return (
      <group
        ref={ref}
        {...props}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <primitive object={clonedScene} />
        {children}
      </group>
    );
  },
);

Model.displayName = "Model";

export default React.memo(Model);
