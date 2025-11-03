import { Line } from 'react-konva';

interface GridProps {
    width: number;
    height: number;
    gridSize: number;
}

export default function Grid({ width, height, gridSize }: GridProps) {
    const lines = [];
    
    {/* Vertical lines */}
    for (let i = 0; i < width / gridSize; i++) {
        lines.push(
            <Line
                key={`v${i}`}
                points={[i * gridSize, 0, i * gridSize, height]}
                stroke="#ddd"
            />
        );
    }

    {/* Horizontal lines */}
    for (let j = 0; j < height / gridSize; j++) {
        lines.push(
            <Line
                key={`h${j}`}
                points={[0, j * gridSize, width, j * gridSize]}
                stroke="#ddd"
            />
        );
    }
    
    return <>{lines}</>;
}
