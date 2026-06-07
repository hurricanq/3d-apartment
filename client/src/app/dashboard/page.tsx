"use client";

import React, { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Templates from "./Templates";
import Furniture from "./Furniture";
import TemplateDialog from "@/components/dialogs/TemplateDialog";
import FurnitureDialog from "@/components/dialogs/FurnitureDialog";
import { Plus } from "lucide-react";

type SortOption = "newest" | "az";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [activeTab, setActiveTab] = useState<"templates" | "furniture">("templates");

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [furnitureDialogOpen, setFurnitureDialogOpen] = useState(false);

  // Clear search on tab switch
  const handleTabChange = (tab: "templates" | "furniture") => {
    setActiveTab(tab);
    setSearch("");
  };

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-black">
          <div className="max-w-6xl mx-auto py-24 px-6 lg:px-0 space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <p className="text-gray-400">
                You need to log in before accessing your dashboard!
              </p>

              <SignInButton>
                <Button variant="secondary">Log In</Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-6xl mx-auto py-24 px-6 lg:px-0 space-y-6">
            {/* Header section with Create Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="font-semibold text-3xl">Admin Dashboard</h1>
                <p className="text-gray-400">
                  Manage rooms, walls, flooring templates, and furniture library.
                </p>
              </div>

              <div>
                {activeTab === "templates" ? (
                  <Button
                    onClick={() => setTemplateDialogOpen(true)}
                    className="bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 font-medium shadow-md shadow-white/5"
                  >
                    <Plus className="w-4 h-4" /> Create Template
                  </Button>
                ) : (
                  <Button
                    onClick={() => setFurnitureDialogOpen(true)}
                    className="bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 font-medium shadow-md shadow-white/5"
                  >
                    <Plus className="w-4 h-4" /> Create Furniture
                  </Button>
                )}
              </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex space-x-6 border-b border-neutral-800 pb-px">
              <button
                onClick={() => handleTabChange("templates")}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 outline-none ${
                  activeTab === "templates"
                    ? "text-white border-white"
                    : "text-neutral-500 border-transparent hover:text-white"
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => handleTabChange("furniture")}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 outline-none ${
                  activeTab === "furniture"
                    ? "text-white border-white"
                    : "text-neutral-500 border-transparent hover:text-white"
                }`}
              >
                Furniture Library
              </button>
            </div>

            {/* Filters (Search & Sort) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search bar */}
              <input
                type="text"
                placeholder={
                  activeTab === "templates"
                    ? "Search templates by name..."
                    : "Search furniture by ID or name..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 transition-colors"
              />

              {/* Sort dropdown */}
              <Select
                value={sort}
                onValueChange={(v: SortOption) => setSort(v)}
              >
                <SelectTrigger className="w-full sm:w-40 bg-neutral-900 border-neutral-800 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="az">A - Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tab content */}
            <div className="pt-2">
              {activeTab === "templates" ? (
                <Templates search={search} sort={sort} />
              ) : (
                <Furniture search={search} sort={sort} />
              )}
            </div>
          </div>
        </div>

        {/* Create Dialogs */}
        <TemplateDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
        />
        <FurnitureDialog
          open={furnitureDialogOpen}
          onOpenChange={setFurnitureDialogOpen}
        />
      </SignedIn>
    </>
  );
};

export default Dashboard;
