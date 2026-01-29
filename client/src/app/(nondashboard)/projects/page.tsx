"use client";

import React, { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import TemplatesList from "@/components/TemplatesList";
import Designs from "./Designs";

const Projects = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "az">("newest");

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-black">
          <RedirectToSignIn />
        </div>
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-6xl mx-auto py-24 px-6 lg:px-0 space-y-6">
            <div className="space-y-1">
              <h1 className="font-semibold text-3xl">All projects</h1>
              <p className="text-gray-400">
                Manage and edit your room designs.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search bar */}
              <input
                type="text"
                placeholder="Search designs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-neutral-800 text-white focus:outline-white transition-colors"
              />

              {/* Sort dropdown */}
              <Select
                value={sort}
                onValueChange={(v: any) => setSort(v as any)}
              >
                <SelectTrigger className="w-40 bg-white text-black">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="az">A - Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Create New Design button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-black">
                    <Plus />
                    Create New Design
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
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
            </div>

            <Designs search={search} sort={sort} />
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default Projects;
