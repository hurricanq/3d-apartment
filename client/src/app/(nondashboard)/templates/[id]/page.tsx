"use client";

import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { useParams } from "next/navigation";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

// Shadcn UI components & Lucide icons
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { SaveIcon } from "lucide-react";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  fetchTemplateById,
  updateTemplate,
} from "@/lib/features/template/templateSlice";

// Constants
import { NAVBAR_HEIGHT } from "@/lib/constants";

// Interfaces
interface NewTemplateData {
  rooms?: any[];
}

interface SelectedWall {
  roomId: number;
  wallId: number;
}

// Functions
function Floor({
  material,
  position,
  width,
  height,
}: {
  material: string;
  position: [number, number, number];
  width: number;
  height: number;
}) {
  const floorTexture = useTexture(`/textures/${material}.jpg`);
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={floorTexture} />
    </mesh>
  );
}

const TemplatePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTemplate } = useSelector(
    (state: RootState) => state.templates
  );

  // States for rooms
  const [rooms, setRooms] = useState<any[]>([]);

  // States for selected wall
  const [selectedWall, setSelectedWall] = useState<SelectedWall | null>(null);
  const [hoveredWall, setHoveredWall] = useState<SelectedWall | null>(null);

  // Lights
  const [ambientIntensity, setAmbientIntensity] = useState<number>(1);

  // Fetch design by ID (on mount) from the backend
  useEffect(() => {
    dispatch(fetchTemplateById(String(id)));
  }, [id, dispatch]);

  // Load models and rooms from data of selectedDesign
  useEffect(() => {
    if (selectedTemplate?.data.rooms) {
      setRooms(selectedTemplate.data.rooms); // Load rooms (from data) into the local state
    }
  }, [selectedTemplate]);

  // Handle wall selection
  const handleWallSelect = (roomId: number, wallId: number): void => {
    setSelectedWall({ roomId, wallId });
  };

  // Update wall color
  const updateWallColor = (color: string): void => {
    if (!selectedWall) return;
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === selectedWall.roomId
          ? {
              ...room,
              walls: room.walls.map((wall: any) =>
                wall.id === selectedWall.wallId ? { ...wall, color } : wall
              ),
            }
          : room
      )
    );
  };

  // Save design (update the JSON data of the scene to the database)
  const saveDesign = () => {
    if (!selectedTemplate || !id) {
      console.error("Cannot save: selectedTemplate or ID is missing.");
      return;
    }

    // 1. Construct the new 'data' payload
    // This payload includes the current furniture models state,
    // and the updated room/wall data from local state.
    const newData: NewTemplateData = {
      rooms: rooms, // Use updated rooms from local state
    };

    // 2. Prepare the update DTO
    const updateData = {
      data: newData,
    };

    // 3. Dispatch the updateDesign thunk
    dispatch(
      updateTemplate({
        id: Number(id),
        data: updateData,
      })
    )
      .unwrap()
      .then(() => {
        alert("Template saved successfully!");
      })
      .catch((error: any) => {
        alert("Failed to save template: " + error.message);
      });
  };

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div
          className="relative h-screen"
          style={{ marginTop: `${-NAVBAR_HEIGHT}px` }}
        >
          <Canvas camera={{ position: [0, 1.6, 5], fov: 75 }} shadows>
            <ambientLight intensity={ambientIntensity} />

            <gridHelper args={[50, 100]} />

            {/* Render rooms */}
            {rooms.map((room: any) => (
              <group key={room.id}>
                {/* Floors */}
                {room.floors.map((floor: any) => (
                  <Floor
                    key={floor.id}
                    material={floor.material}
                    width={floor.dimensions.width}
                    height={floor.dimensions.height}
                    position={[
                      floor.position.x,
                      floor.position.y,
                      floor.position.z,
                    ]}
                  />
                ))}

                {/* Walls */}
                {room.walls.map((wall: any) => {
                  const isHovered =
                    hoveredWall?.roomId === room.id &&
                    hoveredWall?.wallId === wall.id;
                  return (
                    <mesh
                      key={wall.id}
                      position={[
                        wall.position.x,
                        wall.position.y,
                        wall.position.z,
                      ]}
                      rotation={[
                        wall.rotation.x,
                        wall.rotation.y,
                        wall.rotation.z,
                      ]}
                      receiveShadow
                      castShadow={false}
                      onClick={() => handleWallSelect(room.id, wall.id)}
                      onPointerOver={() =>
                        setHoveredWall({ roomId: room.id, wallId: wall.id })
                      }
                      onPointerOut={() => setHoveredWall(null)}
                    >
                      <boxGeometry
                        args={[
                          wall.dimensions.width,
                          wall.dimensions.height,
                          wall.dimensions.depth,
                        ]}
                      />
                      <meshStandardMaterial
                        color={wall.color}
                        emissive={isHovered ? "#00FF00" : "#000000"} // Highlight with emissive glow
                        emissiveIntensity={isHovered ? 1 : 0}
                      />
                    </mesh>
                  );
                })}
              </group>
            ))}

            <OrbitControls
              enablePan={true}
              enableRotate={true}
              rotateSpeed={0.6}
            />
          </Canvas>

          {/* UI Buttons */}
          <div
            className="absolute top-0 left-5 z-10 flex gap-2"
            style={{ marginTop: `${NAVBAR_HEIGHT + 15}px` }}
          >
            {/* Save design */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={saveDesign}>
                  <SaveIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Design</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Wall Color Picker */}
          {selectedWall && (
            <div className="absolute right-5 top-2/3 transform -translate-y-1/2 z-50 bg-white p-4 rounded shadow-lg">
              <Label className="block mb-2">Wall Color</Label>
              <HexColorPicker
                color={
                  rooms
                    .find((r) => r.id === selectedWall.roomId)
                    ?.walls.find((w: any) => w.id === selectedWall.wallId)
                    ?.color || "#ffffff"
                }
                onChange={updateWallColor}
              />
              <Button onClick={() => setSelectedWall(null)} className="mt-2">
                Close
              </Button>
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
};

export default TemplatePage;
