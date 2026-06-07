"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { createFurniture, updateFurniture, Furniture } from "@/lib/features/furniture/furnitureSlice";
import { fetchCategories } from "@/lib/features/category/categorySlice";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface FurnitureDialogProps {
  furniture?: Furniture | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FurnitureDialog({
  furniture,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: FurnitureDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const isEdit = !!furniture;

  // Redux state for categories
  const { categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  // Form states
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch categories on mount/open
  useEffect(() => {
    if (open && categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, open, categories.length]);

  // Load furniture data on edit
  useEffect(() => {
    if (furniture) {
      setId(furniture.id);
      setName(furniture.name);
      setThumbnailUrl(furniture.thumbnailUrl);
      setModelUrl(furniture.modelUrl);
      setCategoryId(furniture.categoryId);
    } else {
      setId("");
      setName("");
      setThumbnailUrl("");
      setModelUrl("");
      setCategoryId("");
    }
  }, [furniture, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !thumbnailUrl.trim() || !modelUrl.trim() || !categoryId) {
      toast.error("Please fill in all fields and select a category");
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await dispatch(
          updateFurniture({
            id: furniture.id,
            data: {
              name: name.trim(),
              thumbnailUrl: thumbnailUrl.trim(),
              modelUrl: modelUrl.trim(),
              categoryId,
            },
          })
        ).unwrap();
        toast.success("Furniture updated successfully!");
      } else {
        await dispatch(
          createFurniture({
            id: id.trim(),
            name: name.trim(),
            thumbnailUrl: thumbnailUrl.trim(),
            modelUrl: modelUrl.trim(),
            categoryId,
          } as any) // Backend and slices accept id if passed in payload
        ).unwrap();
        toast.success("Furniture created successfully!");
      }
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save furniture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md bg-neutral-950 text-white border-neutral-800 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Update Furniture" : "Create Furniture"}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Fill in the details below to add or modify a furniture model.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="furniture-id">Furniture ID *</Label>
            <Input
              id="furniture-id"
              placeholder="e.g., modern-sofa-black"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={isEdit}
              className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-white"
              required
            />
            {isEdit && (
              <p className="text-xs text-neutral-500">ID cannot be changed after creation.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="furniture-name">Name *</Label>
            <Input
              id="furniture-name"
              placeholder="e.g., Leather Sofa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="furniture-thumb">Thumbnail URL *</Label>
            <Input
              id="furniture-thumb"
              placeholder="e.g., /models/thumbnails/sofa.png"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="furniture-model">Model URL (.glb/.gltf) *</Label>
            <Input
              id="furniture-model"
              placeholder="e.g., /models/sofa.glb"
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="furniture-category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
                {categories.length === 0 && !categoriesLoading && (
                  <SelectItem value="none" disabled>
                    No categories found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-neutral-200">
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
