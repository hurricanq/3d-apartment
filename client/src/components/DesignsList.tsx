"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { fetchDesigns, deleteDesign } from "../lib/features/design/designSlice";

import LoadingSpinner from "./LoadingSpinner";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TemplatesList from "./TemplatesList";
import RenameDesign from "./buttons/RenameDesign";
import DeleteDesign from "./buttons/DeleteDesign";

export default function DesignsList() {
  const dispatch = useDispatch<AppDispatch>();
  const { designs, loading, error } = useSelector(
    (state: RootState) => state.designs
  );

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  const handleDelete = (id: number) => {
    dispatch(deleteDesign(id));
  };

  return (
    <div className="flex flex-col gap-5">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus />
            Create New Design
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Choose a template</DialogTitle>
            <DialogDescription>
              Customize your own room based on a template.
            </DialogDescription>
          </DialogHeader>
          <TemplatesList />
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div>
        <h3 className="text-lg font-bold mb-3">My Designs</h3>
        <div className="grid grid-cols-3 gap-5">
          {designs.map((des) => (
            <div key={des.id} className="flex flex-col gap-3">
              <Link
                href={`/designs/${des.id}`}
                className="px-3 py-3 rounded bg-white shadow hover:bg-gray-100"
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold line-clamp-1">{des.name}</h4>
                    <Image
                      src="/placeholder.png"
                      width={300}
                      height={300}
                      alt="Image of the design"
                    />
                  </div>
                </div>
              </Link>

              <div className="flex gap-1">
                {/* Rename button */}
                <RenameDesign desId={des.id} />

                {/* Delete button */}
                <DeleteDesign desId={des.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
