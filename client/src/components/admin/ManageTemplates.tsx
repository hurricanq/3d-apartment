import React, { useEffect } from "react";
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
import { Button } from "../ui/button";
import { Info } from "lucide-react";
import RenameTemplate from "../buttons/RenameTemplate";
import DeleteTemplate from "../buttons/DeleteTemplate";

const ManageTemplates = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading, error } = useSelector(
    (state: RootState) => state.templates
  );

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-3">All Templates</h3>
      <div className="grid grid-cols-4">
        {templates.map((tem) => (
          <div key={tem.id} className="flex flex-col gap-3">
            <Link
              href={`/templates/${tem.id}`}
              className="px-3 py-3 rounded bg-white shadow hover:bg-gray-100"
            >
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold line-clamp-1">{tem.name}</h4>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
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
      </div>
    </div>
  );
};

export default ManageTemplates;
