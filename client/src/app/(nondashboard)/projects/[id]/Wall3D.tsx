import React, { useMemo, ReactNode } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

import { Wall, Window, Door } from "./types";
import { wallToMeshData } from "./wallToMeshData";
import { createDoorGeometry, createWindowGeometry } from "./createGeometry";
import { DoorFrame } from "./DoorFrame";
import { WindowFrame } from "./WindowFrame";

interface Wall3DProps {
  wall: Wall;
  windows?: Window[];
  doors?: Door[];
  children?: ReactNode;
  highlighted?: boolean;
  onClick?: () => void;
  onHover?: (hover: boolean) => void;
  onDoorClick?: (doorId: string) => void;
  onWindowClick?: (windowId: string) => void;
}

export default function Wall3D({
  wall,
  windows = [],
  doors = [],
  children,
  highlighted = false,
  onClick,
  onHover,
  onDoorClick,
  onWindowClick,
}: Wall3DProps) {
  const { length, angle, center } = wallToMeshData(wall);

  const wallTexture = useTexture(`/textures/${wall.material}.jpg`);
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(length, wall.dimensions.height);

  // Create geometry with CSG operations
  const { geometry, material } = useMemo(() => {
    const evaluator = new Evaluator();
    evaluator.attributes = ["position", "normal", "uv"];
    evaluator.useGroups = false;

    // Create the main wall brush. the geometry produced by BoxGeometry is
    // centered at the origin, which means the bottom of the wall would sit
    // half a height below y=0.  all of our window/door math assumes the
    // floor is at y=0, so translate the box upward by half its height before
    // running any CSG operations.  once the wall geometry is bottom‑aligned
    // the helpers below no longer need to offset their y coords.
    const wallGeo = new THREE.BoxGeometry(
      length,
      wall.dimensions.height,
      wall.dimensions.depth,
    );
    // move the geometry so that y=0 corresponds to the floor / bottom of wall
    wallGeo.translate(0, wall.dimensions.height / 2, 0);

    const wallBrush = new Brush(wallGeo);
    wallBrush.updateMatrixWorld();

    let result = wallBrush;

    // Subtract windows from the wall
    windows.forEach((window) => {
      const windowGeometry = createWindowGeometry(window, wall, length);
      const windowBrush = new Brush(windowGeometry);
      windowBrush.updateMatrixWorld();

      result = evaluator.evaluate(result, windowBrush, SUBTRACTION);
    });

    // Subtract doors from the wall
    doors.forEach((door) => {
      const doorGeometry = createDoorGeometry(door, wall, length);
      const doorBrush = new Brush(doorGeometry);
      doorBrush.updateMatrixWorld();

      result = evaluator.evaluate(result, doorBrush, SUBTRACTION);
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      color: highlighted ? "#60a5fa" : wall.color,
      emissive: highlighted
        ? new THREE.Color("#2563eb")
        : new THREE.Color("#000000"),
      emissiveIntensity: highlighted ? 0.4 : 0,
      side: THREE.FrontSide,
    });

    return { geometry: result.geometry, material: wallMaterial };
  }, [wall, length, windows, doors, highlighted, wallTexture]);

  return (
    <group position={[center.x, 0, center.z]} rotation={[0, -angle, 0]}>
      <mesh
        geometry={geometry}
        material={material}
        receiveShadow
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover?.(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover?.(false);
          document.body.style.cursor = "default";
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      />

      {/* Render window and door frames */}
      {windows.map((window) => (
        <WindowFrame
          key={`frame-${window.id}`}
          window={window}
          wallLength={length}
          wallDepth={wall.dimensions.depth}
          onClick={() => onWindowClick?.(window.id)}
        />
      ))}

      {doors.map((door) => (
        <DoorFrame
          key={`frame-${door.id}`}
          door={door}
          wallLength={length}
          wallDepth={wall.dimensions.depth}
          wallHeight={wall.dimensions.height}
          onClick={() => onDoorClick?.(door.id)}
        />
      ))}

      {children}
    </group>
  );
}
