"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import { useParams } from "next/navigation";
import FloorPlanGrid from "./FloorPlanGrid";
import Konva from "konva";

import { snapPoint } from "./snap";
import WallLayer from "./WallLayer";
import { ToolMode, Wall, Point, Window } from "./types";
import Scene3D from "./Scene3D";

import { Button } from "@/components/ui/button";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchDesignById } from "@/lib/features/design/designSlice";
import WindowLayer from "./WindowLayer";
import { findNearestWall } from "./pointToSegment";

const FloorPlanPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedDesign } = useSelector((state: RootState) => state.designs);

  const stageRef = useRef<Konva.Stage>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [walls, setWalls] = useState<Wall[]>([]);
  const [drawingStart, setDrawingStart] = useState<Point | null>(null);
  const [previewEnd, setPreviewEnd] = useState<Point | null>(null);

  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);

  const [windows, setWindows] = useState<Window[]>([
    {
      id: "win-1",
      wallId: "rw-f",
      offset: 1.5, // meters from wall start
      width: 1.2,
      height: 1.2,
      sillHeight: 0.9, // from floor
    },
  ]);
  const [windowPreview, setWindowPreview] = useState<{
    wallId: string;
    offset: number;
    width: number;
  } | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  // Floor dimensions (width, height)
  const [floorDimensions, setFloorDimensions] = useState({
    width: 0,
    height: 0,
  });

  type ViewMode = "2d" | "3d";

  const [viewMode, setViewMode] = useState<ViewMode>("2d");

  const [deleteButtonPos, setDeleteButtonPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

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
  }, [selectedDesign]);

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
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

    /* =======================
     DRAW WALL MODE
     ======================= */
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

    /* =======================
     DRAW WINDOW MODE
     ======================= */
    if (toolMode === "draw-window") {
      setWindowPreview(null);
      const snap = findNearestWall(world, walls);
      if (!snap || snap.distance > 0.3) return;

      const wallLen = Math.hypot(
        snap.wall.end.x - snap.wall.start.x,
        snap.wall.end.y - snap.wall.start.y,
      );

      const WINDOW_WIDTH = 1.2;

      const offset = snap.projection.t * wallLen - WINDOW_WIDTH / 2;

      setWindows((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          wallId: snap.wall.id,
          offset: Math.max(0, Math.min(wallLen - WINDOW_WIDTH, offset)),
          width: WINDOW_WIDTH,
          height: 1.2,
          sillHeight: 0.9,
        },
      ]);

      return;
    }

    /* =======================
     OTHER MODES (select, etc.)
     ======================= */
  };

  /* ---------------- Mouse Move (Preview) ---------------- */

  const handleMouseMove = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const world = getWorldPoint(pointer);
    if (!world) return;

    /* =====================
     WALL PREVIEW
     ===================== */
    if (toolMode === "draw-wall" && drawingStart) {
      const snapped = snapPoint(world, GRID_STEP);
      setPreviewEnd(snapped);
      return;
    }

    /* =====================
     WINDOW PREVIEW
     ===================== */
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

      const PREVIEW_WIDTH = 1.2;

      const offset = snap.projection.t * wallLen - PREVIEW_WIDTH / 2;

      setWindowPreview({
        wallId: snap.wall.id,
        offset: Math.max(0, Math.min(wallLen - PREVIEW_WIDTH, offset)),
        width: PREVIEW_WIDTH,
      });

      return;
    }

    /* =====================
     OTHER MODES
     ===================== */
    setWindowPreview(null);
  }, [toolMode, drawingStart, walls]);

  const buildFloorPlanJSON = () => {
    return {
      rooms: [
        {
          id: "room",
          name: "Room",

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
        },
      ],
    };
  };

  const handleSave = async () => {
    if (!id) return;

    const payload = buildFloorPlanJSON();

    try {
      const res = await fetch(`http://localhost:3001/designs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: payload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save design");
      }

      const result = await res.json();
      console.log("Saved design:", result);

      alert("Design saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save design");
    }
  };

  const updateWindow = (id: string, data: Partial<Window>) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data } : w)),
    );
  };

  /* ---------------- Render ---------------- */

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

            setDeleteButtonPos(null);
          }}
        >
          Delete
        </Button>
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
              <FloorPlanGrid
                width={width}
                height={height}
                gridSize={PIXELS_PER_METER}
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
          </Stage>
        ) : (
          <Scene3D
            floor={{
              width: floorDimensions.width,
              height: floorDimensions.height,
              material: "Maple",
            }}
            walls={walls || []}
            windows={windows || []}
          />
        )}
      </div>
    </div>
  );
};

export default FloorPlanPage;
