"use client"

import { BarChart2, Building2, ChevronRight, ClipboardList, Shield, Users } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"

import { NavUser } from "@/components/nav-user"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getCurrentUserFromAPI } from "@/lib/api"

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "System Administration",
      url: "#",
      items: [
        {
          title: "User Management",
          url: "/employee",
          icon: Users,
        },
        {
          title: "Role Management",
          url: "/roles",
          icon: Shield,
        },
        {
          title: "Academic Units",
          url: "/unit",
          icon: Building2,
        },
      ],
    },
    {
      title: "Tracer Activities ",
      url: "#",
      items: [
        {
          title: "Survey Management",
          url: "/survey",
          icon: ClipboardList,
        },
        {
          title: "Response Data",
          url: "/response",
          icon: BarChart2,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const isDashboardActive = pathname === "/"
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userData, setUserData] = useState({
    name: "User",
    email: "user@example.com",
    avatar: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data from API
        const currentUser = await getCurrentUserFromAPI()
        
        console.log('Sidebar - Current user data:', currentUser)
        console.log('Sidebar - Role name:', currentUser.role_name)
        console.log('Sidebar - Role:', currentUser.role)
        
        // Use 'role' field instead of 'role_name'
        setUserRole(currentUser.role || currentUser.role_name || null)
        setUserData({
          name: currentUser.username || currentUser.id || "User",
          email: currentUser.email || "user@example.com",
          avatar: "",
        })
      } catch (err) {
        console.error('Error fetching user data:', err)
        // If error, keep default values
      }
    }

    fetchUserData()
  }, [])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/LogoITK.png" alt="Logo ITK" className="h-8 w-8 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Tracer Study</span>
                  <span className="truncate text-xs">Institut Teknologi Kalimantan</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => {
          // Hide System Administration menu for non-admin users
          if (item.title === "System Administration" && userRole !== "Admin") {
            return null
          }
          
          return (
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                >
                  <CollapsibleTrigger>
                    {item.title}{" "}
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((subItem) => {
                        const isActive = pathname.startsWith(subItem.url)
                        const IconComponent = subItem.icon

                        return (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild isActive={isActive}>
                              <a href={subItem.url} className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {subItem.title}
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
