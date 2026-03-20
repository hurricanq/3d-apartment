"use client";

import React, { useState } from "react";

import { Grid2X2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { ScrollArea } from "./ui/scroll-area";
import { Room } from "@/app/(nondashboard)/projects/[id]/types";
import MaterialList from "./MaterialList";

const RoomsList = ({
  rooms,
  selectedRoom,
  onHover,
  onLeave,
  onSelect,
  onChangeMaterial,
  onClose,
}: {
  rooms: Room[];
  selectedRoom: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  onSelect: (id: string) => void;
  onChangeMaterial: (material: string) => void;
  onClose: () => void;
}) => {
  const [showRooms, setShowRooms] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setShowRooms(!showRooms)}>
            <Grid2X2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>All Rooms</p>
        </TooltipContent>
      </Tooltip>

      {showRooms && (
        <ScrollArea className="h-[200px] w-[250px] rounded-md border p-4 bg-white">
          <div className="flex flex-col gap-2">
            {rooms.map((r, index) => (
              <div
                key={r.id}
                className={`flex items-center justify-between border p-2 rounded hover:bg-gray-100 ${selectedRoom === r.id ? "bg-blue-100" : ""}`}
                onMouseEnter={() => onHover(r.id)}
                onMouseLeave={onLeave}
              >
                <span>Room {index + 1}</span>

                <Button size="sm" onClick={() => onSelect(r.id)}>
                  Material
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {selectedRoom && showRooms && (
        <div className="border bg-white p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Floor Material</span>

            <Button size="sm" variant="outline" onClick={onClose}>
              <X />
            </Button>
          </div>

          <MaterialList height="200" width="250" onClick={onChangeMaterial} />
        </div>
      )}
    </div>
  );
};

export default RoomsList;
