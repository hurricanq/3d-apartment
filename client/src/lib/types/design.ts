import {
  Floor,
  Wall,
  Window,
  Door,
  ModelData,
  Room,
} from "@/app/(nondashboard)/projects/[id]/types";

export interface RoomData {
  id: string;
  name: string;
  floors: Floor[];
  walls: Wall[];
  windows: Window[];
  doors: Door[];
  detectedRooms: Room[];
  models: ModelData[];
}

export interface DesignData {
  rooms: RoomData[];
}
