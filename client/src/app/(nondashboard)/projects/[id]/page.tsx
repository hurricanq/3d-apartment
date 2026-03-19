"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { useParams } from "next/navigation";
import Grid2D from "./Grid2D";
import Konva from "konva";

import { snapPoint } from "./snap";
import WallLayer from "./WallLayer";
import {
  ToolMode,
  Wall,
  Point,
  Window,
  Door,
  ViewMode,
  elementPreview,
  Room,
  ModelData,
} from "./types";
import Scene3D from "./Scene3D";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  fetchDesignById,
  updateDesign,
} from "@/lib/features/design/designSlice";
import WindowLayer from "./WindowLayer";
import DoorLayer from "./DoorLayer";
import { findNearestWall } from "./pointToSegment";
import DimensionLayer from "./DimensionLayer";
import { detectRooms } from "./roomDetection";
import { DesignData } from "@/lib/types/design";

const FloorPlanPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedDesign } = useSelector((state: RootState) => state.designs);

  const stageRef = useRef<Konva.Stage>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // States for modes
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [toolMode, setToolMode] = useState<ToolMode>("select");

  // States for walls
  const [walls, setWalls] = useState<Wall[]>([]);
  const [drawingStart, setDrawingStart] = useState<Point | null>(null);
  const [previewEnd, setPreviewEnd] = useState<Point | null>(null);
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);

  // States for windows
  const [windows, setWindows] = useState<Window[]>([]);
  const [windowPreview, setWindowPreview] = useState<elementPreview | null>(
    null,
  );
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [windowParameters, setWindowParameters] = useState({
    width: 2.4,
    height: 1.2,
    sillHeight: 0.9, // from floor
  });

  // States for doors
  const [doors, setDoors] = useState<Door[]>([]);
  const [doorPreview, setDoorPreview] = useState<elementPreview | null>(null);
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);
  const [doorParameters, setDoorParameters] = useState({
    width: 0.8,
    height: 2.4,
    swingDirection: "right" as "in" | "out" | "left" | "right",
  });

  // States for models
  const [models, setModels] = useState<ModelData[]>([]);

  // Floor dimensions (width, height)
  const [floorDimensions, setFloorDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [deleteButtonPos, setDeleteButtonPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);

  // Fetch design by ID (on mount) from the backend
  useEffect(() => {
    dispatch(fetchDesignById(Number(id)));
  }, [id, dispatch]);

  // Load rooms from data of selectedDesign
  useEffect(() => {
    const rooms = selectedDesign?.data?.rooms;

    if (!rooms || rooms.length === 0) return;

    const room = rooms[0];

    // Load floor dimensions
    if (room.floors && room.floors.length > 0) {
      setFloorDimensions({
        width: room.floors[0].dimensions.width,
        height: room.floors[0].dimensions.height,
      });
    }

    // Load walls
    if (room.walls && room.walls.length > 0) {
      setWalls(room.walls);
    }

    // Load doors
    if (room.doors && room.doors.length > 0) {
      setDoors(room.doors);
    }

    // Load windows
    if (room.windows && room.windows.length > 0) {
      setWindows(room.windows);
    }

    // Load models
    if (room.models && room.models.length > 0) {
      setModels(room.models);
    }
  }, [selectedDesign]);

  useEffect(() => {
    const detected = detectRooms(walls);
    setRooms(detected);
  }, [walls]);

  const GRID_STEP = 0.25; // meters (25cm)
  const width = 1600;
  const height = 800;
  const PIXELS_PER_METER = 50;

  const floorWidthPx = floorDimensions.width * PIXELS_PER_METER;
  const floorHeightPx = floorDimensions.height * PIXELS_PER_METER;

  const floorX = (width - floorWidthPx) / 2;
  const floorY = (height - floorHeightPx) / 2;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Cancel current wall drawing
        setDrawingStart(null);
        setPreviewEnd(null);
      }

      // Delete selected item with Delete key
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedWallId) {
          setWalls((prev) => prev.filter((w) => w.id !== selectedWallId));
          setSelectedWallId(null);
          setDeleteButtonPos(null);
        }
        if (selectedWindowId) {
          setWindows((prev) => prev.filter((w) => w.id !== selectedWindowId));
          setSelectedWindowId(null);
          setDeleteButtonPos(null);
        }
        if (selectedDoorId) {
          setDoors((prev) => prev.filter((d) => d.id !== selectedDoorId));
          setSelectedDoorId(null);
          setDeleteButtonPos(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWallId, selectedWindowId, selectedDoorId]);

  /* ---------------- Zoom ---------------- */

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.05;

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const clampedScale = Math.min(4, Math.max(0.5, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setScale(clampedScale);
    setPosition(newPos);
  };

  /* ---------------- Screen → World (Robust) ---------------- */

  const getWorldPoint = (pointer: { x: number; y: number }) => {
    const stage = stageRef.current;
    if (!stage) return null;

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();

    const world = transform.point(pointer);

    // Convert to floor-relative world coordinates (meters)
    return {
      x: (world.x - floorX) / PIXELS_PER_METER,
      y: (world.y - floorY) / PIXELS_PER_METER,
    };
  };

  /* ---------------- Mouse Down ---------------- */

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    console.log("toolMode:", toolMode);
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const world = getWorldPoint(pointer);
    if (!world) return;

    /* Draw Wall Mode */
    if (toolMode === "draw-wall") {
      const snapped = snapPoint(world, GRID_STEP);

      // First click → start wall
      if (!drawingStart) {
        setDrawingStart(snapped);
        setPreviewEnd(snapped);
        return;
      }

      // Second click → finish wall
      const newWall: Wall = {
        id: crypto.randomUUID(),
        start: drawingStart,
        end: snapped,
        dimensions: {
          height: 3,
          depth: 0.1,
        },
        color: "#ffffff",
        material: "Plastic",
      };

      setWalls((prev) => [...prev, newWall]);
      setDrawingStart(null);
      setPreviewEnd(null);
      return;
    }

    // Draw window
    if (toolMode === "draw-window") {
      setWindowPreview(null);
      const snap = findNearestWall(world, walls);
      if (!snap || snap.distance > 0.3) return;

      const wallLen = Math.hypot(
        snap.wall.end.x - snap.wall.start.x,
        snap.wall.end.y - snap.wall.start.y,
      );

      const WINDOW_WIDTH = windowParameters.width;

      const offset = snap.projection.t * wallLen - WINDOW_WIDTH / 2;

      setWindows((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          wallId: snap.wall.id,
          offset: Math.max(0, Math.min(wallLen - WINDOW_WIDTH, offset)),
          width: WINDOW_WIDTH,
          height: windowParameters.height,
          sillHeight: windowParameters.sillHeight,
        },
      ]);

      return;
    }

    // Draw door
    if (toolMode === "draw-door") {
      setDoorPreview(null);
      const snap = findNearestWall(world, walls);
      if (!snap || snap.distance > 0.3) return;

      const wallLen = Math.hypot(
        snap.wall.end.x - snap.wall.start.x,
        snap.wall.end.y - snap.wall.start.y,
      );

      const DOOR_WIDTH = doorParameters.width;

      const offset = snap.projection.t * wallLen - DOOR_WIDTH / 2;

      setDoors((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          wallId: snap.wall.id,
          offset: Math.max(0, Math.min(wallLen - DOOR_WIDTH, offset)),
          width: DOOR_WIDTH,
          height: doorParameters.height,
          swingDirection: doorParameters.swingDirection,
        },
      ]);

      return;
    }
  };

  // Mouse move (preview)
  const handleMouseMove = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const world = getWorldPoint(pointer);
    if (!world) return;

    /* Wall Preview */
    if (toolMode === "draw-wall" && drawingStart) {
      const snapped = snapPoint(world, GRID_STEP);
      setPreviewEnd(snapped);
      return;
    }

    /* Window Preview */
    if (toolMode === "draw-window") {
      const snap = findNearestWall(world, walls);

      if (!snap || snap.distance > 0.3) {
        setWindowPreview(null);
        return;
      }

      const wallLen = Math.hypot(
        snap.wall.end.x - snap.wall.start.x,
        snap.wall.end.y - snap.wall.start.y,
      );

      const PREVIEW_WIDTH = windowParameters.width;

      const offset = snap.projection.t * wallLen - PREVIEW_WIDTH / 2;

      setWindowPreview({
        wallId: snap.wall.id,
        offset: Math.max(0, Math.min(wallLen - PREVIEW_WIDTH, offset)),
        width: PREVIEW_WIDTH,
      });

      return;
    }

    if (toolMode === "draw-door") {
      const snap = findNearestWall(world, walls);

      if (!snap || snap.distance > 0.3) {
        setDoorPreview(null);
        return;
      }

      const wallLen = Math.hypot(
        snap.wall.end.x - snap.wall.start.x,
        snap.wall.end.y - snap.wall.start.y,
      );

      const PREVIEW_WIDTH = doorParameters.width;

      const offset = snap.projection.t * wallLen - PREVIEW_WIDTH / 2;

      setDoorPreview({
        wallId: snap.wall.id,
        offset: Math.max(0, Math.min(wallLen - PREVIEW_WIDTH, offset)),
        width: PREVIEW_WIDTH,
      });

      return;
    }
    setWindowPreview(null);
  }, [toolMode, drawingStart, walls, windowParameters, doorParameters]);

  const buildFloorPlanJSON = (): DesignData => {
    return {
      rooms: [
        {
          id: "room",
          name: "Main Room",

          floors: [
            {
              id: "rf-1",
              dimensions: {
                width: floorDimensions.width,
                height: floorDimensions.height,
              },
              color: "#FFFFFF",
              material: "Maple",
            },
          ],

          walls: walls.map((wall) => ({
            id: wall.id,
            dimensions: {
              height: wall.dimensions.height,
              depth: wall.dimensions.depth,
            },
            start: wall.start,
            end: wall.end,
            color: wall.color || "#FFFFFF",
            material: wall.material || "Plastic",
          })),

          windows: windows.map((window) => ({
            id: window.id,
            wallId: window.wallId,
            offset: window.offset,
            width: window.width,
            height: window.height,
            sillHeight: window.sillHeight,
          })),

          doors: doors.map((door) => ({
            id: door.id,
            wallId: door.wallId,
            offset: door.offset,
            width: door.width,
            height: door.height,
            swingDirection: door.swingDirection,
          })),

          detectedRooms: rooms.map((room) => ({
            id: room.id,
            // name: `Room ${rooms.indexOf(room) + 1}`,
            area: room.area,
            // perimeter: room.perimeter,
            polygon: room.polygon,
            centroid: room.centroid,
            material: room.material,
          })),

          models: models.map((model) => ({
            id: model.id,
            url: model.url,
            position: model.position,
            scale: model.scale,
            rotation: model.rotation,
            color: model.color,
          })),
        },
      ],
    };
  };

  // Save design
  const handleSave = async () => {
    if (!id) {
      console.error("Design ID is missing");
      alert("Design ID is missing");
      return;
    }

    // Build the DesignData structure
    const designData = buildFloorPlanJSON();

    try {
      // Dispatch the updateDesign action with correct structure
      const result = await dispatch(
        updateDesign({
          id: Number(id),
          data: {
            data: designData,
          },
        }),
      ).unwrap();

      console.log("Saved design:", result);
      alert("Design saved successfully!");

      return result;
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save design");
      throw err;
    }
  };

  const updateWindow = (id: string, data: Partial<Window>) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data } : w)),
    );
  };

  const updateDoor = (id: string, data: Partial<Door>) => {
    setDoors((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
  };

  return (
    <div className="relative min-h-screen">
      {/* Toolbar */}
      <div className="absolute top-18 left-6 z-10 flex gap-2">
        <Button onClick={handleSave}>Save Design</Button>

        <div className="flex gap-2">
          <Button
            disabled={viewMode === "2d" ? false : true}
            variant={`${toolMode === "draw-wall" ? "secondary" : "default"}`}
            onClick={() => {
              setToolMode("draw-wall");
              setWindowPreview(null);
              setDrawingStart(null);
              setPreviewEnd(null);
            }}
          >
            Draw Walls
          </Button>

          <Button
            disabled={viewMode === "2d" ? false : true}
            variant={`${toolMode === "draw-window" ? "secondary" : "default"}`}
            onClick={() => setToolMode("draw-window")}
          >
            Add Window
          </Button>

          <Button
            disabled={viewMode === "2d" ? false : true}
            variant={`${toolMode === "draw-door" ? "secondary" : "default"}`}
            onClick={() => setToolMode("draw-door")}
          >
            Add Door
          </Button>

          <Button
            disabled={viewMode === "2d" ? false : true}
            variant={`${toolMode === "select" ? "secondary" : "default"}`}
            onClick={() => {
              setToolMode("select");
              setWindowPreview(null);
              setDrawingStart(null);
              setPreviewEnd(null);
            }}
          >
            Select
          </Button>
        </div>

        <Button
          onClick={() => {
            setViewMode((prev) => (prev === "2d" ? "3d" : "2d"));
          }}
        >
          {viewMode === "2d" ? "3D Mode" : "2D Mode"}
        </Button>
      </div>

      {toolMode === "select" && deleteButtonPos && (
        <Button
          variant="destructive"
          className="absolute z-20"
          style={{
            left: deleteButtonPos.x + 12,
            top: deleteButtonPos.y + 12,
          }}
          onClick={() => {
            if (selectedWallId) {
              setWalls((prev) => prev.filter((w) => w.id !== selectedWallId));
              setSelectedWallId(null);
            }

            if (selectedWindowId) {
              setWindows((prev) =>
                prev.filter((w) => w.id !== selectedWindowId),
              );
              setSelectedWindowId(null);
            }

            if (selectedDoorId) {
              setDoors((prev) => prev.filter((d) => d.id !== selectedDoorId));
              setSelectedDoorId(null);
            }

            setDeleteButtonPos(null);
          }}
        >
          Delete
        </Button>
      )}

      {viewMode === "2d" && (
        <div className="absolute bottom-10 right-5 z-10 bg-white p-3 rounded shadow flex flex-col gap-5">
          <div className="flex gap-3">
            <div className="space-y-3">
              <Label>Door Width</Label>
              <Input
                type="number"
                value={doorParameters.width}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setDoorParameters({ ...doorParameters, width: v });
                }}
                className="w-16"
              />
            </div>

            <div className="space-y-3">
              <Label>Door Height</Label>
              <Input
                type="number"
                value={doorParameters.height}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setDoorParameters({ ...doorParameters, height: v });
                }}
                className="w-16"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="space-y-3">
              <Label>Window Width</Label>
              <Input
                type="number"
                value={windowParameters.width}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setWindowParameters({ ...windowParameters, width: v });
                }}
                className="w-16"
              />
            </div>

            <div className="space-y-3">
              <Label>Window Height</Label>
              <Input
                type="number"
                value={windowParameters.height}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setWindowParameters({ ...windowParameters, height: v });
                }}
                className="w-16"
              />
            </div>

            <div className="space-y-3">
              <Label>Window Sill Height</Label>
              <Input
                type="number"
                value={windowParameters.sillHeight}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setWindowParameters({ ...windowParameters, sillHeight: v });
                }}
                className="w-16"
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-screen border relative">
        {viewMode === "2d" &&
        floorDimensions.width > 0 &&
        floorDimensions.height > 0 ? (
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={toolMode === "select"}
            onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
            onWheel={handleWheel}
            onMouseDown={(e) => {
              // existing draw-wall logic still runs here
              handleMouseDown(e);

              // deselect wall nd window when clicking empty space
              if (toolMode === "select" && e.target === e.target.getStage()) {
                setSelectedWallId(null);
                setSelectedWindowId(null);
                setDeleteButtonPos(null);
              }
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Grid (non-interactive) */}
            <Layer listening={false}>
              <Grid2D
                width={width}
                height={height}
                cellSize={PIXELS_PER_METER}
              />
            </Layer>

            <Layer listening={false}>
              <Rect
                x={floorX}
                y={floorY}
                width={floorDimensions.width * PIXELS_PER_METER}
                height={floorDimensions.height * PIXELS_PER_METER}
                fill="#ffffff"
                stroke="#111"
                strokeWidth={2}
              />
            </Layer>

            {/* Add Dimension Layer here - pass meters, not pixels */}
            <DimensionLayer
              floorX={floorX}
              floorY={floorY}
              floorWidth={floorDimensions.width}
              floorHeight={floorDimensions.height}
              pixelsPerMeter={PIXELS_PER_METER}
            />

            <Layer listening={false}>
              {rooms.map((room, i) => {
                if (!room?.polygon) return null;

                const points = room.polygon.flatMap((p) => [
                  floorX + p.x * PIXELS_PER_METER,
                  floorY + p.y * PIXELS_PER_METER,
                ]);

                return (
                  <React.Fragment key={room.id}>
                    <Line
                      points={points}
                      closed
                      fill="rgba(34,197,94,0.15)"
                      stroke="rgba(34,197,94,0.6)"
                      strokeWidth={2}
                    />

                    <Text
                      x={floorX + room.centroid.x * PIXELS_PER_METER}
                      y={floorY + room.centroid.y * PIXELS_PER_METER}
                      text={`${room.area.toFixed(2)} m²`}
                      fontSize={14}
                      fill="#065f46"
                      align="center"
                      offsetX={30}
                      offsetY={10}
                    />
                  </React.Fragment>
                );
              })}
            </Layer>

            {/* Render rooms */}
            <Layer>
              <WallLayer
                walls={walls}
                pixelsPerMeter={PIXELS_PER_METER}
                floorX={floorX}
                floorY={floorY}
                toolMode={toolMode}
                hoveredWallId={hoveredWallId}
                selectedWallId={selectedWallId}
                onHoverWall={(wallId) => {
                  setHoveredWallId(wallId);
                }}
                onSelectWall={(wallId, screenPos) => {
                  setSelectedWallId(wallId);
                  setDeleteButtonPos(screenPos);
                }}
              />

              {/* Preview wall */}
              {toolMode === "draw-wall" && drawingStart && previewEnd && (
                <Line
                  points={[
                    floorX + drawingStart.x * PIXELS_PER_METER,
                    floorY + drawingStart.y * PIXELS_PER_METER,
                    floorX + previewEnd.x * PIXELS_PER_METER,
                    floorY + previewEnd.y * PIXELS_PER_METER,
                  ]}
                  stroke="#2563eb"
                  strokeWidth={0.2 * PIXELS_PER_METER}
                  dash={[8, 4]}
                />
              )}
            </Layer>

            <Layer>
              <WindowLayer
                windows={windows}
                walls={walls}
                scale={PIXELS_PER_METER}
                floorX={floorX}
                floorY={floorY}
                preview={windowPreview}
                onUpdateWindow={updateWindow}
                toolMode={toolMode}
                selectedWindowId={selectedWindowId}
                onSelectWindow={(id, pos) => {
                  setSelectedWindowId(id);
                  setSelectedWallId(null); // deselect wall
                  setDeleteButtonPos(pos);
                }}
              />
            </Layer>

            <Layer>
              <DoorLayer
                doors={doors}
                walls={walls}
                scale={PIXELS_PER_METER}
                floorX={floorX}
                floorY={floorY}
                preview={doorPreview}
                onUpdateDoor={updateDoor}
                toolMode={toolMode}
                selectedDoorId={selectedDoorId}
                onSelectDoor={(id, pos) => {
                  setSelectedDoorId(id);
                  setSelectedWallId(null); // deselect wall
                  setDeleteButtonPos(pos);
                }}
              />
            </Layer>
          </Stage>
        ) : (
          <Scene3D
            rooms={rooms}
            walls={walls || []}
            windows={windows || []}
            doors={doors}
            models={models}
          />
        )}
      </div>
    </div>
  );
};

export default FloorPlanPage;
