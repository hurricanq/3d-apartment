"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchTemplates } from "@/lib/features/template/templateSlice";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import RenameTemplate from "@/components/buttons/RenameTemplate";
import DeleteTemplate from "@/components/buttons/DeleteTemplate";

interface TemplatesProps {
  search: string;
  sort: "newest" | "az";
}

const Templates = ({ search, sort }: TemplatesProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading, error } = useSelector(
    (state: RootState) => state.templates,
  );

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const processedTemplates = useMemo(() => {
    let result = [...templates];

    // Filter by search
    if (search.trim() !== "") {
      result = result.filter((tem) =>
        tem.name.toLowerCase().includes(search.toLowerCase()),
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
  }, [templates, search, sort]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {processedTemplates.map((tem) => (
        <div key={tem.id} className="flex flex-col gap-3">
          <Link
            href={`/templates/${tem.id}`}
            className="overflow-hidden rounded bg-white shadow hover:bg-gray-100"
          >
            <Image
              src="/renders/placeholder.png"
              width={300}
              height={300}
              alt="Image of the template"
              className="hover:scale-110 transition-transform"
            />
          </Link>

          {/* Template Name */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold line-clamp-1">{tem.name}</h4>
          </div>

          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-black">
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tem.description}</p>
              </TooltipContent>
            </Tooltip>

            {/* Rename button */}
            <RenameTemplate temId={tem.id} />

            {/* Delete button */}
            <DeleteTemplate temId={tem.id} />
          </div>
        </div>
      ))}

      {processedTemplates.length === 0 && (
        <p className="col-span-3 text-gray-400">No templates found.</p>
      )}
    </div>
  );
};

export default Templates;
