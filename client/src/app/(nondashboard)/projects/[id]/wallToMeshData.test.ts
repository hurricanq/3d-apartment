import { wallToMeshData } from "./wallToMeshData";

test("wallToMeshData returns correct transform", () => {
  const wall = {
    id: "test-wall",
    start: { x: 0, y: 0 },
    end: { x: 8, y: 0 },
    dimensions: {
      height: 3,
      depth: 0.1,
    },
    color: "#FFFFFF",
    material: "Plastic",
  };

  const { length, angle, center } = wallToMeshData(wall);

  expect(length).toBe(8);
  expect(angle).toBe(0);
  expect(center.x).toBe(4);
});
