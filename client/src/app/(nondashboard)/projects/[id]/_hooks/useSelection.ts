import { useState, useCallback } from "react";

export function useSelection() {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [selectedDoor, setSelectedDoor] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const [hoveredWall, setHoveredWall] = useState<string | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const selectModel = useCallback((id: number) => {
    setSelectedModel(id);
    setSelectedWall(null);
    setSelectedDoor(null);
    setSelectedWindow(null);
  }, []);

  const selectWall = useCallback((id: string) => {
    setSelectedWall(id);
    setSelectedModel(null);
    setSelectedDoor(null);
    setSelectedWindow(null);
  }, []);

  const selectDoor = useCallback((id: string) => {
    setSelectedDoor(id);
    setSelectedModel(null);
    setSelectedWall(null);
    setSelectedWindow(null);
  }, []);

  const selectWindow = useCallback((id: string) => {
    setSelectedWindow(id);
    setSelectedModel(null);
    setSelectedWall(null);
    setSelectedDoor(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedModel(null);
    setSelectedWall(null);
    setSelectedDoor(null);
    setSelectedWindow(null);
  }, []);

  return {
    // States
    selectedModel,
    selectedWall,
    selectedDoor,
    selectedWindow,
    selectedRoom,
    hoveredWall,
    hoveredRoom,

    // Setters
    setSelectedModel,
    setSelectedWall,
    setSelectedDoor,
    setSelectedWindow,
    setSelectedRoom,
    setHoveredWall,
    setHoveredRoom,

    // Actions
    selectModel,
    selectWall,
    selectDoor,
    selectWindow,
    clearSelection,
  };
}
