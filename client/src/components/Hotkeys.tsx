"use client";

import React, { useState } from "react";

import { CircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { Label } from "@/components/ui/label";

const hotkeysList = [
  { key: "T", action: "Translate Mode" },
  { key: "R", action: "Rotate Mode" },
  { key: "E", action: "Scale Mode" },
  { key: "Arrow Keys", action: "Translate"},
  { key: "A & D", action: "Rotate"},
  { key: "M & N", action: "Scale"},
  { key: "Delete", action: "Delete Object" },
];

const Hotkeys = () => {
  const [showHotkeys, setShowHotkeys] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setShowHotkeys(!showHotkeys)}>
            <CircleQuestionMark />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Hotkeys</p>
        </TooltipContent>
      </Tooltip>

      {showHotkeys && (
        <div className="rounded-md border p-4 bg-white flex flex-col space-y-2">
          {hotkeysList.map((hotkey) => (
            <div key={hotkey.key} className="flex justify-between gap-3">
              <Label>{hotkey.action}</Label>
              <p className="border rounded-md p-2">{hotkey.key}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hotkeys;
