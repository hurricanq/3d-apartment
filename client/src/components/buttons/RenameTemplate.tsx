import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { updateTemplate } from "@/lib/features/template/templateSlice";

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
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

const RenameTemplate = ({ temId }: { temId: number }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (temId && newName.trim()) {
      setLoading(true);
      try {
        await dispatch(
          updateTemplate({ id: temId, data: { name: newName.trim() } })
        ).unwrap();
        setNewName("");
        setOpen(false);
        toast("Template name updated!", {
          action: {
            label: "OK",
            onClick: () => console.log("OK"),
          },
        });
      } catch (error) {
        console.error("Failed to rename template:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <Pencil />
          Rename
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Template</DialogTitle>
          <DialogDescription>
            Update the name of your template.
          </DialogDescription>
        </DialogHeader>
        <div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim() && !loading) {
                handleRename();
              }
            }}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter new name"
            required
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleRename} disabled={!newName.trim() || loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameTemplate;
