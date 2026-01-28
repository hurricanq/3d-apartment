"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { fetchFurnitureByCategory } from "../lib/features/furniture/furnitureSlice";
import { fetchCategories } from "../lib/features/category/categorySlice";

import LoadingSpinner from "./LoadingSpinner";
import { HousePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { ScrollArea } from "./ui/scroll-area";

const FurnitureList = ({
  onClick,
}: {
  onClick?: (modelUrl: string) => void;
}) => {
  const [showCategories, setShowCategories] = useState(false);
  const [showFurniture, setShowFurniture] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { furnitureInCategory, loading, error } = useSelector(
    (state: RootState) => state.furniture,
  );

  const handleFurnitureByCategory = (cid: string) => {
    dispatch(fetchFurnitureByCategory(cid));
    setShowFurniture(!showFurniture);
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setShowCategories(!showCategories)}>
            <HousePlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Furniture</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex gap-2">
        {/* Categories List */}
        {showCategories && (
          <ScrollArea className="h-[500px] w-[300px] rounded-md border p-4 bg-white">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleFurnitureByCategory(cat.id)}
                  className="space-y-2 p-2 shadow rounded"
                >
                  <div className="rounded overflow-hidden">
                    <Image
                      src={`/renders/${cat.id}.png`}
                      width={150}
                      height={150}
                      alt="Category image"
                      className="aspect-square object-cover hover:scale-150 transition-transform"
                    />
                  </div>

                  <div>{cat.name}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Furniture (of a Category) List */}
        {showCategories && showFurniture && (
          <ScrollArea className="h-[500px] w-[150px] rounded-md border p-4 bg-white">
            <div className="grid grid-cols-1 gap-2">
              {furnitureInCategory.length > 0 ? (
                furnitureInCategory.map((fur) => (
                  <div
                    key={fur.id}
                    onClick={() => onClick?.(fur.modelUrl)}
                    className="space-y-2 p-2 shadow rounded"
                  >
                    <div className="rounded overflow-hidden">
                      <Image
                        src={`/renders/${fur.id}.png`}
                        width={150}
                        height={150}
                        alt="Model image"
                        className="aspect-square object-cover hover:scale-150 transition-transform"
                      />
                    </div>

                    <div>{fur.name}</div>
                  </div>
                ))
              ) : (
                <div className="p-2">No models available.</div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default FurnitureList;
