"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchDesigns } from "@/lib/features/design/designSlice";

import LoadingSpinner from "@/components/LoadingSpinner";
import RenameDesign from "@/components/buttons/RenameDesign";
import DeleteDesign from "@/components/buttons/DeleteDesign";

import { formatDate } from "@/lib/format";

interface DesignsProps {
  search: string;
  sort: "newest" | "az";
}

const Designs = ({ search, sort }: DesignsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { designs, loading, error } = useSelector(
    (state: RootState) => state.designs,
  );

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  const processedDesigns = useMemo(() => {
    let result = [...designs];

    // Filter by search
    if (search.trim() !== "") {
      result = result.filter((des) =>
        des.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Sort
    if (sort === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "newest") {
      // Prefer createdAt if exists, otherwise fallback to id
      result.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return b.id - a.id; // fallback if id is numeric
      });
    }

    return result;
  }, [designs, search, sort]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {processedDesigns.map((des) => (
        <div key={des.id} className="flex flex-col gap-3">
          <Link
            href={`/projects/${des.id}`}
            className="rounded overflow-hidden aspect-square bg-white shadow hover:bg-gray-100"
          >
            <Image
              src="/renders/placeholder.png"
              width={300}
              height={300}
              alt="Image of the design"
              className="object-cover hover:scale-110 transition-transform"
            />
          </Link>

          {/* Design Name */}
          <div className="flex flex-col space-y-1">
            <h4 className="font-semibold line-clamp-1">{des.name}</h4>
            <p className="text-neutral-400">
              Last edited: {formatDate(des.updatedAt)}
            </p>
          </div>

          <div className="flex gap-1">
            {/* Rename button */}
            <RenameDesign desId={des.id} />

            {/* Delete button */}
            <DeleteDesign desId={des.id} />
          </div>
        </div>
      ))}

      {processedDesigns.length === 0 && (
        <p className="col-span-3 text-neutral-400">No designs found.</p>
      )}
    </div>
  );
};

export default Designs;
