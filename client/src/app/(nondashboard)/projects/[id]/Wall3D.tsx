interface Wall3DProps {
  wall: {
    dimensions: { height: number; depth: number };
    start: { x: number; y: number };
    end: { x: number; y: number };
    color: string;
  };
}

export default function Wall3D({ wall }: Wall3DProps) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Center position in 2D
  const cx = (wall.start.x + wall.end.x) / 2;
  const cy = (wall.start.y + wall.end.y) / 2;

  return (
    <mesh
      position={[cx, wall.dimensions.height / 2, cy]} // center in XZ, lift in Y
      rotation={[0, -angle, 0]}
    >
      {/* Box: length × height × thickness */}
      <boxGeometry
        args={[length, wall.dimensions.height, wall.dimensions.depth]}
      />
      <meshStandardMaterial color={wall.color} />
    </mesh>
  );
}
