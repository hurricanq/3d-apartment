"use client";

import React from 'react';
import dynamic from 'next/dynamic';

/* import Three.js scene
const Scene = dynamic(() => import("./Scene"), {
    ssr: false,
});
*/

import Room from './ApartmentThree';

const DesignsPage = () => {
    return (
        <div>
            <Room />
        </div>
    )
}

export default DesignsPage
