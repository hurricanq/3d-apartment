import { Paintbrush } from "lucide-react"
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NAVBAR_HEIGHT } from "@/lib/constants"
 
// Menu items
const items = [
    {
        title: "My Designs",
        icon: Paintbrush,
    }
]

export default function UserDashboardSidebar({ onSelect }: { onSelect: (tool: string) => void }) {
    return (
        <Sidebar
            style={{ marginTop: `${NAVBAR_HEIGHT}px` }}
        >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                <button
                                    onClick={() => onSelect(item.title)}
                                    className="flex items-center gap-2 w-full text-left"
                                >
                                    <item.icon />
                                    <span>{item.title}</span>
                                </button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}