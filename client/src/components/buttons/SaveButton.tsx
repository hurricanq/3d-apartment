"use client";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { updateDesign } from "@/lib/features/design/designSlice";
import { useState } from "react";

export default function SaveButton({
  id,
  data,
}: {
  id: number;
  data: Record<string, unknown>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = () => {
    setSaving(true);
    setError(null);

    dispatch(updateDesign({ id, data }))
      .unwrap()
      .then(() => {
        setSaving(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to save");
        setSaving(false);
      });
  };

  return (
    <div className="p-4 border-b flex items-center justify-between bg-gray-50">
      <h2 className="text-lg font-bold">Editing Design #{id}</h2>

      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {saving ? "Saving..." : "Save"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
