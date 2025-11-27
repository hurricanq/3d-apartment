"use client"

import React, { useState } from "react"

import { SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import UserDashboardSidebar from "@/components/dashboard/UserDashboardSidebar"
import DesignsList from "../DesignsList"

export default function UserDashboard() {
    const [active, setActive] = useState<string>("")
    return (
        <SidebarProvider>
            <UserDashboardSidebar onSelect={setActive} />
            <div className="px-6">
                <SidebarTrigger className="py-12" />

                {active === "My Designs" && <DesignsList />}
                {!active && (
                    <p className="text-gray-600 mt-5">Please choose a section in the dashboard.</p>
                )}
            </div>
        </SidebarProvider>
    )
}