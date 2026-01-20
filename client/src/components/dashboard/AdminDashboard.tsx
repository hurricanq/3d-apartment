"use client";

import React, { useState } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminDashboardSidebar from "@/components/dashboard/AdminDashboardSidebar";
import ManageTemplates from "../admin/ManageTemplates";

export default function UserDashboard() {
  const [active, setActive] = useState<string>("");
  return (
    <SidebarProvider>
      <AdminDashboardSidebar onSelect={setActive} />
      <div>
        <SidebarTrigger className="py-12" />

        {active === "Manage Templates" && <ManageTemplates />}
        {!active && (
          <p className="text-gray-600 mt-5">
            Please choose a section in the dashboard.
          </p>
        )}
      </div>
    </SidebarProvider>
  );
}
