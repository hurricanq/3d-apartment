"use client";

import { Stage, Layer, Rect, Line } from "react-konva";
import React, { useState, useEffect, useRef } from "react";
import FloorPlanGrid from "./FloorPlanGrid";
import Konva from "konva";

import { snapPoint } from "./snap";
import WallLayer from "./WallLayer";
import { ToolMode, Wall, Point } from "./types";

const FloorPlanPage = () => {
  const stageRef = useRef<Konva.Stage>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [walls, setWalls] = useState<Wall[]>([]);
  const [drawingStart, setDrawingStart] = useState<Point | null>(null);
  const [previewEnd, setPreviewEnd] = useState<Point | null>(null);

  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);

  const [deleteButtonPos, setDeleteButtonPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const GRID_STEP = 0.25; // meters (25cm)
  const width = 1600;
  const height = 700;
  const PIXELS_PER_METER = 50;

  // Floor size (meters)
  const FLOOR_WIDTH = 8;
  const FLOOR_HEIGHT = 6;

  const floorWidthPx = FLOOR_WIDTH * PIXELS_PER_METER;
  const floorHeightPx = FLOOR_HEIGHT * PIXELS_PER_METER;

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
    if (toolMode !== "draw-wall") return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const world = getWorldPoint(pointer);
    if (!world) return;

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
      thickness: 0.2,
    };

    setWalls((prev) => [...prev, newWall]);
    setDrawingStart(null);
    setPreviewEnd(null);
  };

  /* ---------------- Mouse Move (Preview) ---------------- */

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (toolMode !== "draw-wall") return;
    if (!drawingStart) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const world = getWorldPoint(pointer);
    if (!world) return;

    const snapped = snapPoint(world, GRID_STEP);
    setPreviewEnd(snapped);
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white shadow rounded p-2 flex gap-2">
        <button
          className={`px-3 py-1 rounded border ${
            toolMode === "draw-wall" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
          onClick={() => {
            setToolMode("draw-wall");
            setDrawingStart(null);
            setPreviewEnd(null);
          }}
        >
          Draw Wall
        </button>

        <button
          className={`px-3 py-1 rounded border ${
            toolMode === "select" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
          onClick={() => {
            setToolMode("select");
            setDrawingStart(null);
            setPreviewEnd(null);
          }}
        >
          Select
        </button>
      </div>

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

          // deselect wall when clicking empty space
          if (toolMode === "select" && e.target === e.target.getStage()) {
            setSelectedWallId(null);
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

        {/* Floor (non-interactive) */}
        <Layer listening={false}>
          <Rect
            x={floorX}
            y={floorY}
            width={floorWidthPx}
            height={floorHeightPx}
            fill="#f5f5f5"
            stroke="#111"
            strokeWidth={2}
          />
        </Layer>

        {/* Walls */}
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
      </Stage>

      {toolMode === "select" && selectedWallId && deleteButtonPos && (
        <button
          className="absolute z-20 px-2 py-1 text-sm bg-red-600 text-white rounded shadow"
          style={{
            left: deleteButtonPos.x + 12,
            top: deleteButtonPos.y + 12,
          }}
          onClick={() => {
            setWalls((prev) => prev.filter((w) => w.id !== selectedWallId));
            setSelectedWallId(null);
            setDeleteButtonPos(null);
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default FloorPlanPage;
