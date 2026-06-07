"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { createTemplate, updateTemplate, Template } from "@/lib/features/template/templateSlice";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus, Trash, Info } from "lucide-react";

interface WallInput {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  material: string;
  depth: number;
  height: number;
}

interface TemplateDialogProps {
  template?: Template | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TemplateDialog({
  template,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: TemplateDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const isEdit = !!template;

  // Form states
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Room states
  const [roomId, setRoomId] = useState("room");
  const [roomName, setRoomName] = useState("Room");
  
  // Walls state
  const [walls, setWalls] = useState<WallInput[]>([]);

  // Floor states
  const [floorId, setFloorId] = useState("rf-1");
  const [floorColor, setFloorColor] = useState("#FFFFFF");
  const [floorMaterial, setFloorMaterial] = useState("Maple");
  const [floorWidth, setFloorWidth] = useState(8);
  const [floorHeight, setFloorHeight] = useState(6);

  const [loading, setLoading] = useState(false);

  // Load template data on Edit
  useEffect(() => {
    if (template) {
      setId(template.id);
      setName(template.name);
      setDescription(template.description);

      const firstRoom = template.data?.rooms?.[0];
      if (firstRoom) {
        setRoomId(firstRoom.id || "room");
        setRoomName(firstRoom.name || "Room");
        
        // Load walls
        if (firstRoom.walls) {
          setWalls(
            firstRoom.walls.map((w) => ({
              id: w.id || "",
              startX: w.start?.x ?? 0,
              startY: w.start?.y ?? 0,
              endX: w.end?.x ?? 0,
              endY: w.end?.y ?? 0,
              color: w.color || "#FFFFFF",
              material: w.material || "Plastic",
              depth: w.dimensions?.depth ?? 0.1,
              height: w.dimensions?.height ?? 3,
            }))
          );
        } else {
          setWalls([]);
        }

        // Load floors
        const firstFloor = firstRoom.floors?.[0];
        if (firstFloor) {
          setFloorId(firstFloor.id || "rf-1");
          setFloorColor(firstFloor.color || "#FFFFFF");
          setFloorMaterial(firstFloor.material || "Maple");
          setFloorWidth(firstFloor.dimensions?.width ?? 8);
          setFloorHeight(firstFloor.dimensions?.height ?? 6);
        }
      }
    } else {
      // Clear for create mode
      setId("");
      setName("");
      setDescription("");
      setRoomId("room");
      setRoomName("Room");
      setWalls([
        { id: "rw-f", startX: 0, startY: 0, endX: 8, endY: 0, color: "#FFFFFF", material: "Plastic", depth: 0.1, height: 3 },
        { id: "rw-b", startX: 0, startY: 6, endX: 8, endY: 6, color: "#FFFFFF", material: "Plastic", depth: 0.1, height: 3 },
        { id: "rw-l", startX: 0, startY: 0, endX: 0, endY: 6, color: "#FFFFFF", material: "Plastic", depth: 0.1, height: 3 },
        { id: "rw-r", startX: 8, startY: 0, endX: 8, endY: 6, color: "#FFFFFF", material: "Plastic", depth: 0.1, height: 3 },
      ]);
      setFloorId("rf-1");
      setFloorColor("#FFFFFF");
      setFloorMaterial("Maple");
      setFloorWidth(8);
      setFloorHeight(6);
    }
  }, [template, open]);

  const addWall = () => {
    const nextIndex = walls.length + 1;
    setWalls([
      ...walls,
      {
        id: `rw-${nextIndex}`,
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 0,
        color: "#FFFFFF",
        material: "Plastic",
        depth: 0.1,
        height: 3,
      },
    ]);
  };

  const removeWall = (index: number) => {
    setWalls(walls.filter((_, i) => i !== index));
  };

  const updateWallField = (index: number, field: keyof WallInput, value: any) => {
    setWalls(
      walls.map((w, i) => (i === index ? { ...w, [field]: value } : w))
    );
  };

  const autoCalculateFloor = () => {
    if (walls.length === 0) {
      setFloorWidth(8);
      setFloorHeight(6);
      return;
    }
    const maxX = Math.max(...walls.map((w) => Math.max(w.startX, w.endX)));
    const maxY = Math.max(...walls.map((w) => Math.max(w.startY, w.endY)));
    setFloorWidth(maxX);
    setFloorHeight(maxY);
    toast.info(`Auto-calculated Floor to ${maxX}m x ${maxY}m`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) {
      toast.error("Please fill in the template ID and Name");
      return;
    }

    setLoading(true);

    const designData = {
      rooms: [
        {
          id: roomId,
          name: roomName,
          walls: walls.map((w) => ({
            id: w.id,
            start: { x: Number(w.startX), y: Number(w.startY) },
            end: { x: Number(w.endX), y: Number(w.endY) },
            color: w.color,
            material: w.material,
            dimensions: {
              depth: Number(w.depth),
              height: Number(w.height),
            },
          })),
          floors: [
            {
              id: floorId,
              color: floorColor,
              material: floorMaterial,
              dimensions: {
                width: Number(floorWidth),
                height: Number(floorHeight),
              },
            },
          ],
          windows: [],
          doors: [],
          detectedRooms: [],
          models: [],
        },
      ],
    };

    try {
      if (isEdit) {
        await dispatch(
          updateTemplate({
            id: template.id,
            data: {
              name: name.trim(),
              description: description.trim(),
              data: designData,
            },
          })
        ).unwrap();
        toast.success("Template updated successfully!");
      } else {
        await dispatch(
          createTemplate({
            id: id.trim(),
            name: name.trim(),
            description: description.trim(),
            data: designData,
          })
        ).unwrap();
        toast.success("Template created successfully!");
      }
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] bg-neutral-950 text-white border-neutral-800 flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Update Template" : "Create Room Template"}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Fill in the information below to configure the template's room, walls, and flooring details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 pb-4">
              {/* Basic Template Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-id">Template ID *</Label>
                  <Input
                    id="template-id"
                    placeholder="e.g., standard-room-8x6"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={isEdit}
                    className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-white"
                    required
                  />
                  {isEdit && (
                    <p className="text-xs text-neutral-500">ID cannot be changed after creation.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Master Bedroom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-white"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="template-desc">Description</Label>
                  <Textarea
                    id="template-desc"
                    placeholder="Enter template description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-white min-h-[60px]"
                  />
                </div>
              </div>

              {/* Room Metadata */}
              <div className="border-t border-neutral-800 pt-4 space-y-4">
                <h3 className="text-md font-semibold text-neutral-200">Room Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-id">Room ID</Label>
                    <Input
                      id="room-id"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="bg-neutral-900 border-neutral-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Room Name</Label>
                    <Input
                      id="room-name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="bg-neutral-900 border-neutral-800 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Walls List */}
              <div className="border-t border-neutral-800 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold text-neutral-200">Walls ({walls.length})</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addWall}
                    className="bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Wall
                  </Button>
                </div>

                {walls.length === 0 ? (
                  <p className="text-sm text-neutral-500 italic">No walls added. Templates require walls to define boundaries.</p>
                ) : (
                  <div className="space-y-3">
                    {walls.map((wall, index) => (
                      <div
                        key={index}
                        className="bg-neutral-900/50 border border-neutral-800/80 p-3 rounded-lg space-y-3 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-400">Wall #{index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWall(index)}
                            className="text-neutral-500 hover:text-red-500 p-1 h-auto"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 items-end">
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-[11px] text-neutral-400">Wall ID</Label>
                            <Input
                              value={wall.id}
                              onChange={(e) => updateWallField(index, "id", e.target.value)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">Start X</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={wall.startX}
                              onChange={(e) => updateWallField(index, "startX", parseFloat(e.target.value) || 0)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">Start Y</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={wall.startY}
                              onChange={(e) => updateWallField(index, "startY", parseFloat(e.target.value) || 0)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">End X</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={wall.endX}
                              onChange={(e) => updateWallField(index, "endX", parseFloat(e.target.value) || 0)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">End Y</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={wall.endY}
                              onChange={(e) => updateWallField(index, "endY", parseFloat(e.target.value) || 0)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">Color</Label>
                            <Input
                              value={wall.color}
                              onChange={(e) => updateWallField(index, "color", e.target.value)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">Material</Label>
                            <Input
                              value={wall.material}
                              onChange={(e) => updateWallField(index, "material", e.target.value)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">Height (m)</Label>
                            <Input
                              type="number"
                              step="0.05"
                              value={wall.height}
                              onChange={(e) => updateWallField(index, "height", parseFloat(e.target.value) || 0)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-neutral-400">Depth (m)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={wall.depth}
                              onChange={(e) => updateWallField(index, "depth", parseFloat(e.target.value) || 0)}
                              className="bg-neutral-950 border-neutral-800 text-xs h-8 px-2"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floor Details */}
              <div className="border-t border-neutral-800 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold text-neutral-200">Floor Details</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={autoCalculateFloor}
                    className="text-xs text-neutral-300 hover:text-white flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" /> Auto-calculate from walls
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="floor-id">Floor ID</Label>
                    <Input
                      id="floor-id"
                      value={floorId}
                      onChange={(e) => setFloorId(e.target.value)}
                      className="bg-neutral-900 border-neutral-800 text-sm h-9 px-3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor-color">Color</Label>
                    <Input
                      id="floor-color"
                      value={floorColor}
                      onChange={(e) => setFloorColor(e.target.value)}
                      className="bg-neutral-900 border-neutral-800 text-sm h-9 px-3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor-material">Material</Label>
                    <Input
                      id="floor-material"
                      value={floorMaterial}
                      onChange={(e) => setFloorMaterial(e.target.value)}
                      className="bg-neutral-900 border-neutral-800 text-sm h-9 px-3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor-width">Width (m)</Label>
                    <Input
                      id="floor-width"
                      type="number"
                      step="0.1"
                      value={floorWidth}
                      onChange={(e) => setFloorWidth(parseFloat(e.target.value) || 0)}
                      className="bg-neutral-900 border-neutral-800 text-sm h-9 px-3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor-height">Height (m)</Label>
                    <Input
                      id="floor-height"
                      type="number"
                      step="0.1"
                      value={floorHeight}
                      onChange={(e) => setFloorHeight(parseFloat(e.target.value) || 0)}
                      className="bg-neutral-900 border-neutral-800 text-sm h-9 px-3"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-neutral-800 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-neutral-200">
              {loading ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
