"use client";

import React from 'react';
import dynamic from 'next/dynamic';

/* import Three.js scene
const Scene = dynamic(() => import("./Scene"), {
    ssr: false,
});
*/

import SceneRtf from './SceneRtf';

const DesignsPage = () => {
    return (
        <div>
            <SceneRtf />
        </div>
    )
}

export default DesignsPage
