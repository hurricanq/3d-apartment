"use client";

import React, { useState, useEffect, forwardRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  url: string;
  onClick: () => void;
  children: any;
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

      clone.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.material = obj.material.clone(); // Clone material for hover effects
          obj.castShadow = true;
        }
      });

      return clone;
    }, [gltf]);

    const [hovered, setHovered] = useState(false);

    useEffect(() => {
      clonedScene.traverse((obj: any) => {
        if (obj.isMesh) {
          const mat = obj.material;

          if (mat.color) {
            mat.color.set(hovered ? "#00ff00" : "#ffffff");
          }
        }
      });
    }, [hovered, clonedScene]);

    return (
      <group
        ref={ref}
        {...props}
        onPointerDown={onClick}
        onPointerOver={(e: any) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e: any) => {
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

export default Model;
