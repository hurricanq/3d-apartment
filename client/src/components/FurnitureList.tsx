"use client";

import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { fetchFurniture } from "../lib/features/furniture/furnitureSlice";

import LoadingSpinner from './LoadingSpinner';

const FurnitureList = ({ onClick }: { onClick?: (modelUrl: string) => void }) => {
    const [showFurniture, setShowFurniture] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { furniture, loading, error } = useSelector((state: RootState) => state.furniture);

    useEffect(() => {
        dispatch(fetchFurniture());
    }, [dispatch]);

    if (loading) return <LoadingSpinner />;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex gap-2">
            <button
                className="flex gap-2 px-3 py-1 rounded bg-white shadow"
                onClick={() => setShowFurniture(!showFurniture)}
            >
                Add Furniture
            </button>

            {showFurniture && furniture.map(fur => 
                <button
                    key={fur.id}
                    className="px-3 py-1 rounded bg-white shadow"
                    onClick={() => onClick?.(fur.modelUrl)}
                >
                    {fur.name}
                </button>
            )}
        </div>
    )
}

export default FurnitureList
