"use client";

import React, { useState } from "react";
import Image from "next/image";

import { HousePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";

const materials = [
  {
    id: "plastic",
    name: "Plastic",
  },
  {
    id: "maple",
    name: "Maple",
  },
  {
    id: "dark-wood",
    name: "Dark Wood",
  },
  {
    id: "laminate",
    name: "Laminate",
  },
  {
    id: "dark-grey",
    name: "Dark Grey",
  },
  {
    id: "white-squares",
    name: "White Squares",
  },
];

const MaterialList = ({
  height = "500",
  width = "300",
  onClick,
}: {
  height?: string;
  width?: string;
  onClick?: (name: string) => void;
}) => {
  const [showMaterials, setShowMaterials] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setShowMaterials(!showMaterials)}>
            <HousePlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change Material</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex gap-2">
        {/* Material List */}
        {showMaterials && (
          <ScrollArea
            className={`h-[${height}px] w-[${width}px] rounded-md border p-4 bg-white`}
          >
            <div className="grid grid-cols-2 gap-2">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => onClick?.(mat.name)}
                  className="space-y-2 p-2 shadow rounded"
                >
                  <div className="rounded overflow-hidden">
                    <Image
                      src={`/textures/${mat.name}.jpg`}
                      width={150}
                      height={150}
                      alt="Materialimage"
                      className="aspect-square object-cover hover:scale-150 transition-transform"
                    />
                  </div>

                  <div>{mat.name}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default MaterialList;
