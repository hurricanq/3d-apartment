"use client";

import React, { useState } from "react";

import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const LightPanel = ({
  dayNight,
  ambientIntensity,
  objectIntensity,
  onAmbientChange,
  onObjectChange,
}: {
  dayNight: "day" | "night";
  ambientIntensity: number;
  objectIntensity: number;
  onAmbientChange: (value: number[]) => void;
  onObjectChange: (value: number[]) => void;
}) => {
  const [showLights, setShowLights] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setShowLights(!showLights)}>
            <Sun />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Light Panel</p>
        </TooltipContent>
      </Tooltip>

      {showLights && (
        <div className="rounded-md border p-4 bg-white">
          <div className="flex flex-col gap-3">
            {dayNight === "day" && (
              <div className="space-y-3">
                <Label>Ambient Light Intensity</Label>
                <Slider
                  value={[ambientIntensity]}
                  onValueChange={onAmbientChange}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label>Object Light Intensity</Label>
              <Slider
                value={[objectIntensity]}
                onValueChange={onObjectChange}
                min={0}
                max={20}
                step={0.1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightPanel;
