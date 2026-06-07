"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchFurniture, deleteFurniture, Furniture as FurnitureType } from "@/lib/features/furniture/furnitureSlice";
import { fetchCategories } from "@/lib/features/category/categorySlice";
import { Button } from "@/components/ui/button";
import { Info, Pencil, Trash } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import FurnitureDialog from "@/components/dialogs/FurnitureDialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface FurnitureProps {
  search: string;
  sort: "newest" | "az";
}

const Furniture = ({ search, sort }: FurnitureProps) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { furniture, loading: furnitureLoading, error: furnitureError } = useSelector(
    (state: RootState) => state.furniture
  );
  const { categories } = useSelector(
    (state: RootState) => state.categories
  );

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Edit & Delete modal control states
  const [editingFurniture, setEditingFurniture] = useState<FurnitureType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [deletingFurnitureId, setDeletingFurnitureId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchFurniture());
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch]);

  // Map categoryId to Category Name
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // Filter and Sort
  const processedFurniture = useMemo(() => {
    let result = [...furniture];

    // Search filter
    if (search.trim() !== "") {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.categoryId === categoryFilter);
    }

    // Sort
    if (sort === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "newest") {
      result.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return b.id.localeCompare(a.id);
      });
    }

    return result;
  }, [furniture, search, categoryFilter, sort]);

  const handleDelete = async () => {
    if (!deletingFurnitureId) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteFurniture(deletingFurnitureId)).unwrap();
      toast.success("Furniture deleted successfully!");
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete furniture");
    } finally {
      setDeleteLoading(false);
      setDeletingFurnitureId(null);
    }
  };

  if (furnitureLoading) return <LoadingSpinner />;
  if (furnitureError) return <p className="text-red-500">{furnitureError}</p>;

  return (
    <div className="space-y-6">
      {/* Category Filter bar */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-neutral-400">Category Filter:</span>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-neutral-900 border-neutral-800 text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid of Furniture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {processedFurniture.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 bg-neutral-900/40 border border-neutral-800/80 p-4 rounded-lg hover:border-neutral-700 transition-colors">
            <div className="relative aspect-square overflow-hidden rounded bg-neutral-950 flex items-center justify-center border border-neutral-800">
              <img
                src={`/renders/${item.thumbnailUrl}` || "/renders/placeholder.png"}
                alt={item.name}
                className="max-h-full max-w-full object-contain hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/renders/placeholder.png";
                }}
              />
              <span className="absolute top-2 left-2 text-[10px] font-semibold bg-neutral-800 text-white px-2 py-0.5 rounded">
                {categoryMap[item.categoryId] || item.categoryId || "Uncategorized"}
              </span>
            </div>

            {/* Furniture Details */}
            <div className="space-y-1">
              <h4 className="font-semibold text-white line-clamp-1">{item.name}</h4>
              <p className="text-xs text-neutral-400 font-mono line-clamp-1">{item.id}</p>
              <p className="text-[10px] text-neutral-500 line-clamp-1 font-mono" title={item.modelUrl}>
                Model: {item.modelUrl}
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              {/* Edit button */}
              <Button
                size="sm"
                className="flex-1 bg-neutral-800 text-white hover:bg-neutral-700 flex items-center gap-1 h-8"
                onClick={() => {
                  setEditingFurniture(item);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>

              {/* Delete button */}
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 flex items-center gap-1 h-8"
                onClick={() => {
                  setDeletingFurnitureId(item.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}

        {processedFurniture.length === 0 && (
          <p className="col-span-full text-neutral-500 text-center py-12">No furniture items found.</p>
        )}
      </div>

      {/* Edit Dialog */}
      <FurnitureDialog
        furniture={editingFurniture}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingFurniture(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-neutral-950 text-white border-neutral-800">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete this furniture item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-neutral-800">
            <DialogClose asChild>
              <Button variant="outline" className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:text-white">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Furniture;
