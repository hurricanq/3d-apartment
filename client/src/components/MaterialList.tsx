"use client";

import React, { useState } from "react";

import { HousePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const materials = [
  {
    id: "maple",
    name: "Maple",
  },
  {
    id: "dark-wood",
    name: "Dark Wood",
  },
];

const MaterialList = ({ onClick }: { onClick?: (name: string) => void }) => {
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
        <div className="flex flex-col gap-2">
          {showMaterials &&
            materials.map((mat) => (
              <Button key={mat.id} onClick={() => onClick?.(mat.name)}>
                {mat.name}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialList;
