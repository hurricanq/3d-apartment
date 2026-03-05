import React, { useMemo, ReactNode } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

import { Wall, Window, Door } from "./types";
import { wallToMeshData } from "./wallToMeshData";

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

// Helper function to create window cutout geometry
function createWindowGeometry(
  window: Window,
  wall: Wall,
  wallLength: number,
): THREE.BufferGeometry {
  const { offset, width, height, sillHeight } = window;

  // x calc is unaffected by vertical alignment
  const windowCenterX = offset + width / 2 - wallLength / 2;
  // y coordinates are now measured from the floor (y=0) because we translated
  // the wall geometry upward earlier.
  const windowCenterY = sillHeight + height / 2;

  const cutDepth = wall.dimensions.depth + 0.02;
  const cutHeight = height + 0.02;
  const cutWidth = width + 0.02;

  const geometry = new THREE.BoxGeometry(cutWidth, cutHeight, cutDepth);
  geometry.translate(windowCenterX, windowCenterY, 0);

  return geometry;
}

// Helper function to create door cutout geometry
function createDoorGeometry(
  door: Door,
  wall: Wall,
  wallLength: number,
): THREE.BufferGeometry {
  const { offset, width, height } = door;

  const doorCenterX = offset + width / 2 - wallLength / 2;
  // doorCenterY is measured from the floor (y=0).  since the wall is now
  // bottom‑aligned, we can just use half the door height here.
  const doorCenterY = height / 2;

  const cutDepth = wall.dimensions.depth + 0.02;
  const cutHeight = height + 0.02;
  const cutWidth = width + 0.02;

  const geometry = new THREE.BoxGeometry(cutWidth, cutHeight, cutDepth);
  geometry.translate(doorCenterX, doorCenterY, 0);

  return geometry;
}

// Window frame component
function WindowFrame({
  window,
  wallLength,
  wallDepth,
  onClick,
}: {
  window: Window;
  wallLength: number;
  wallDepth: number;
  onClick?: () => void;
}) {
  const { offset, width, height, sillHeight } = window;

  const frameX = offset + width / 2 - wallLength / 2;
  // y coordinate measured from floor
  const frameY = sillHeight + height / 2;
  const frameThickness = 0.05;

  return (
    <group position={[frameX, frameY, wallDepth / 2]}>
      {/* Window glass */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <boxGeometry args={[width - 0.08, height - 0.08, 0.02]} />
        <meshPhysicalMaterial
          color="#88ccff"
          transparent
          opacity={0.4}
          roughness={0}
          metalness={0.1}
          transmission={0.8}
          thickness={0.02}
        />
      </mesh>

      {/* Window frame - top */}
      <mesh position={[0, height / 2 - frameThickness / 2, 0.02]}>
        <boxGeometry args={[width + 0.02, frameThickness, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>

      {/* Window frame - bottom */}
      <mesh position={[0, -height / 2 + frameThickness / 2, 0.02]}>
        <boxGeometry args={[width + 0.02, frameThickness, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>

      {/* Window frame - left */}
      <mesh position={[-width / 2 + frameThickness / 2, 0, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>

      {/* Window frame - right */}
      <mesh position={[width / 2 - frameThickness / 2, 0, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={window.color || "#ffffff"} />
      </mesh>
    </group>
  );
}

// Door frame component
function DoorFrame({
  door,
  wallLength,
  wallDepth,
  wallHeight,
  onClick,
}: {
  door: Door;
  wallLength: number;
  wallDepth: number;
  wallHeight: number;
  onClick?: () => void;
}) {
  const {
    offset,
    width,
    height,
    swingDirection = "out",
    isOpen = false,
  } = door;

  const frameX = offset + width / 2 - wallLength / 2;
  const frameThickness = 0.06;

  const swingAngle = isOpen
    ? swingDirection === "out"
      ? -Math.PI / 2
      : swingDirection === "in"
        ? Math.PI / 2
        : 0
    : 0;

  // the frame group origin stays at the floor (0) now that the wall
  // geometry has been shifted; no need for vertical offsets here.
  return (
    <group position={[frameX, 0, wallDepth / 2]}>
      {/* Door frame - top */}
      <mesh position={[0, height - frameThickness / 2, 0.02]}>
        <boxGeometry args={[width + 0.04, frameThickness, 0.04]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>

      {/* Door frame - left */}
      <mesh position={[-width / 2 + frameThickness / 2, height / 2, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>

      {/* Door frame - right */}
      <mesh position={[width / 2 - frameThickness / 2, height / 2, 0.02]}>
        <boxGeometry args={[frameThickness, height, 0.04]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>

      {/* Door panel */}
      <group position={[0, height / 2, 0.03]} rotation={[0, swingAngle, 0]}>
        <mesh
          position={[width / 2 - 0.02, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <boxGeometry args={[0.04, height - 0.08, width - 0.08]} />
          <meshStandardMaterial color={door.color || "#8b5a2b"} />
        </mesh>
      </group>

      {/* Floor plate under door */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 0.02, wallDepth]} />
        <meshStandardMaterial color={door.color || "#5c4033"} />
      </mesh>
    </group>
  );
}

// helpers exported for unit testing
export { createWindowGeometry, createDoorGeometry };
