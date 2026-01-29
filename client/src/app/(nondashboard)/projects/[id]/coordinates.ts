export function screenToWorld(
  screen: { x: number; y: number },
  camera: {
    scale: number;
    position: { x: number; y: number };
  },
) {
  return {
    x: (screen.x - camera.position.x) / camera.scale,
    y: (screen.y - camera.position.y) / camera.scale,
  };
}

export function worldToScreen(
  world: { x: number; y: number },
  camera: {
    scale: number;
    position: { x: number; y: number };
  },
) {
  return {
    x: world.x * camera.scale + camera.position.x,
    y: world.y * camera.scale + camera.position.y,
  };
}
