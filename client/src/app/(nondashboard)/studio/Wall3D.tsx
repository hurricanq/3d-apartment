interface Wall3DProps {
  wall: {
    start: { x: number; y: number };
    end: { x: number; y: number };
    thickness: number;
  };
  height: number; // wall height in meters
}

export default function Wall3D({ wall, height }: Wall3DProps) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Center position in 2D
  const cx = (wall.start.x + wall.end.x) / 2;
  const cy = (wall.start.y + wall.end.y) / 2;

  return (
    <mesh
      position={[cx, height / 2, cy]} // center in XZ, lift in Y
      rotation={[0, -angle, 0]}
    >
      {/* Box: length × height × thickness */}
      <boxGeometry args={[length, height, wall.thickness]} />
      <meshStandardMaterial color="#9ca3af" />
    </mesh>
  );
}
