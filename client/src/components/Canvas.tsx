"use client";

import React, { useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Grid from "./Grid";
import WallTool from "./tools/WallTool";

const Canvas = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const gridSize = 50;

    const [isWallMode, setIsWallMode] = useState(false);

    return (
        <div>
            <button onClick={() => setIsWallMode((v) => !v)}>
                {isWallMode ? 'Exit Wall Mode' : 'Enter Wall Mode'}
            </button>

            <Stage width={width} height={height}>
                <Layer>
                    {/* Grid */}
                    <Grid width={width} height={height} gridSize={gridSize} />

                    {/* Room floor */}
                    <Rect x={400} y={100} width={800} height={400} fill="brown" stroke="#111" strokeWidth={10} />

                    <WallTool
                        gridSize={gridSize}
                        canvasWidth={width}
                        canvasHeight={height}
                        enabled={isWallMode}
                    />
                </Layer>
            </Stage>
        </div>
    );
};

export default Canvas;