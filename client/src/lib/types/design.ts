import { Wall } from "@/app/(nondashboard)/projects/[id]/types";

export interface FloorData {
  id: string;
  dimensions: {
    width: number;
    height: number;
  };
  color: string;
  material: string;
}

export interface RoomData {
  id: string;
  name: string;
  floors: FloorData[];
  walls: Wall[];
}

export interface DesignData {
  rooms: RoomData[];
}
