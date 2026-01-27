"use client";

import React, { useState, useEffect } from "react";

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
        <div className="flex flex-col gap-2">
          {showCategories &&
            categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => handleFurnitureByCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
        </div>

        {/* Furniture (of a Category) List */}
        <div className="flex flex-col gap-2">
          {showCategories &&
            showFurniture &&
            furnitureInCategory.map((fur) => (
              <Button key={fur.id} onClick={() => onClick?.(fur.modelUrl)}>
                {fur.name}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FurnitureList;
