"use client";

import React, { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Templates from "./Templates";

type SortOption = "newest" | "az";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

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
              <h1 className="font-semibold text-3xl">All templates</h1>
              <p className="text-gray-400">
                Manage and edit your room templates.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search bar */}
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-gray-900 text-white focus:outline-white transition-colors"
              />

              {/* Sort dropdown */}
              <Select
                value={sort}
                onValueChange={(v: SortOption) => setSort(v)}
              >
                <SelectTrigger className="w-40 bg-white text-black">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="az">A - Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Templates search={search} sort={sort} />
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default Dashboard;
