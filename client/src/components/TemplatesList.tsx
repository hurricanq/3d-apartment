"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { fetchTemplates } from "../lib/features/template/templateSlice";
import { createDesign } from "../lib/features/design/designSlice";

import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";

const TemplatesList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useUser();

  const { templates, loading, error } = useSelector(
    (state: RootState) => state.templates,
  );

  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-600">{error}</p>;

  // Create design from template
  const handleCreate = (template: any) => {
    const uniqueName = `New ${template.name}`;

    if (!user) return;

    dispatch(
      createDesign({
        name: uniqueName,
        templateId: template.id,
        userId: user.id,
      }),
    )
      .unwrap()
      .then((design) => {
        router.push(`/projects/${design.id}`);
      })
      .catch((err) => {
        console.error("Create design failed:", err);
      });
  };

  return (
    <div className="flex flex-col gap-3">
      {createError && <p className="text-sm text-red-600">{createError}</p>}

      <div className="grid grid-cols-1 gap-2">
        {templates.map((temp: any) => (
          <Button
            key={temp.id}
            variant="outline"
            className="flex flex-col flex-1"
            disabled={creatingId !== null}
            onClick={() => handleCreate(temp)}
          >
            {creatingId === String(temp.id) ? "Creating..." : temp.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TemplatesList;
