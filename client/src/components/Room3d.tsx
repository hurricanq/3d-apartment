"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import demo from "@/data/floor-plan.json"; // <-- Import external JSON file

// -----------------------------
// Types for the JSON schema
// -----------------------------

type Vec2 = [number, number];

export type Room = {
  id: string;
  points: Vec2[]; // closed polygon, counter-clockwise recommended
  floorMaterial?: string;
  floorHeight?: number; // thickness/extrusion for the floor slab
};

export type Opening = {
  id: string;
  offset: number; // meters from wall.start along wall vector
  width: number;  // meters
  height?: number; // meters; if omitted and type === "door", use wall.height
  bottom?: number; // meters above floor (e.g., window sill)
  type: "door" | "window";
};

export type Wall = {
  id: string;
  start: Vec2; // meters
  end: Vec2;   // meters
  thickness: number; // meters
  height: number;    // meters
  openings?: Opening[]; // doors/windows along the wall
  material?: string;
};

export type Furniture = {
  id: string;
  kind: string; // e.g., "sofa", "table"; demo uses simple boxes
  position: [number, number, number]; // meters (x, y, z)
  size?: [number, number, number];    // meters (x, y, z)
};

export type PlanJSON = {
  meta?: { unit?: "m" | "cm" | "mm" };
  rooms: Room[];
  walls: Wall[];
  furniture?: Furniture[];
};

// -----------------------------
// Utils
// -----------------------------

function length2([x1, y1]: Vec2, [x2, y2]: Vec2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function angle2([x1, y1]: Vec2, [x2, y2]: Vec2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function computeWallSegments(wall: Wall): { start: number; end: number }[] {
  const L = length2(wall.start, wall.end);
  if (!wall.openings || wall.openings.length === 0) return [{ start: 0, end: L }];
  const cuts = wall.openings
    .map((o) => ({ start: clamp(o.offset, 0, L), end: clamp(o.offset + o.width, 0, L) }))
    .sort((a, b) => a.start - b.start);

  const segments: { start: number; end: number }[] = [];
  let cursor = 0;
  for (const c of cuts) {
    if (c.start > cursor) segments.push({ start: cursor, end: c.start });
    cursor = Math.max(cursor, c.end);
  }
  if (cursor < L) segments.push({ start: cursor, end: L });
  return segments;
}

// -----------------------------
// 3D Pieces
// -----------------------------

function FloorMesh({ room }: { room: Room }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    room.points.forEach(([x, z], i) => {
      if (i === 0) s.moveTo(x, z);
      else s.lineTo(x, z);
    });
    s.autoClose = true;
    return s;
  }, [room.points]);

  const geometry = useMemo(() => {
    const depth = room.floorHeight ?? 0.05;
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [shape, room.floorHeight]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial metalness={0.05} roughness={0.9} />
    </mesh>
  );
}

function WallMesh({ wall }: { wall: Wall }) {
  const dirAngle = useMemo(() => angle2(wall.start, wall.end), [wall.start, wall.end]);
  const L = useMemo(() => length2(wall.start, wall.end), [wall.start, wall.end]);
  const segments = useMemo(() => computeWallSegments(wall), [wall]);
  const baseY = wall.height / 2;

  return (
    <group position={[wall.start[0], 0, wall.start[1]]} rotation={[0, -dirAngle, 0]}>
      {segments.map((seg, i) => {
        const segLen = seg.end - seg.start;
        const xCenter = seg.start + segLen / 2;
        return (
          <mesh key={i} position={[xCenter, baseY, 0]} castShadow receiveShadow>
            <boxGeometry args={[segLen, wall.height, wall.thickness]} />
            <meshStandardMaterial />
          </mesh>
        );
      })}
    </group>
  );
}

function FurnitureMesh({ f }: { f: Furniture }) {
  const size = f.size ?? [1, 1, 1];

   
  return (
    <group position={f.position}>
      <mesh castShadow receiveShadow >
        <boxGeometry args={size} />
        <meshStandardMaterial metalness={0.05} roughness={0.8} color="orange" />
      </mesh>
    </group>
  );
}

function SceneContent({ data }: { data: PlanJSON }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.9} castShadow />
      <Grid args={[20, 20]} cellSize={0.5} sectionSize={5} position={[0, 0.001, 0]} />
      {data.rooms.map((r) => (
        <FloorMesh key={r.id} room={r} />
      ))}
      {data.walls.map((w) => (
        <WallMesh key={w.id} wall={w} />
      ))}
      {data.furniture?.map((f) => (
        <FurnitureMesh key={f.id} f={f} />
      ))}
      <OrbitControls makeDefault />
    </>
  );
}

// -----------------------------
// UI Shell + Page
// -----------------------------

export default function Floor3DPage() {
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(demo, null, 2));
  const [data, setData] = useState<PlanJSON>(demo);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function applyJSON() {
    try {
      const parsed = JSON.parse(jsonText) as PlanJSON;
      if (!parsed.rooms || !parsed.walls) throw new Error("JSON must include rooms[] and walls[]");
      setData(parsed);
    } catch (e: any) {
      alert("Invalid JSON: " + e.message);
    }
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "floorplan.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setJsonText(String(reader.result));
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-neutral-50">
      <Card className="order-2 lg:order-1 lg:col-span-1 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Plan JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFromFile(f);
              }}
            />
            <Button variant="secondary" onClick={downloadJSON}>Download</Button>
          </div>
          <Textarea
            className="font-mono text-sm h-[320px]"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={applyJSON}>Apply JSON</Button>
            <Button variant="outline" onClick={() => setJsonText(JSON.stringify(demo, null, 2))}>Reset Demo</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Units are meters. Floors are extruded from room polygons. Walls are auto-split around door/window openings using offset + width along the wall.
          </p>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="order-1 lg:order-2 lg:col-span-2 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="relative h-[70vh] bg-white">
          <Canvas shadows camera={{ position: [8, 8, 8], fov: 45 }}>
            <color attach="background" args={["#f6f7fb"]} />
            <SceneContent data={data} />
          </Canvas>
          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur rounded-xl px-3 py-1 text-xs shadow">
            LMB: orbit · RMB: pan · Wheel: zoom
          </div>
        </div>
      </motion.div>
    </div>
  );
}
