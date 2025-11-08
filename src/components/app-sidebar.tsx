"use client"

import { HomeIcon } from "@heroicons/react/24/outline"
import { Building2, ChevronRight, ClipboardList, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "User Directory",
      url: "#",
      items: [
        {
          title: "Unit Directory",
          url: "/unit",
          icon: Building2,
        },
        {
          title: "Employee Directory",
          url: "/employee",
          icon: Users,
        },
      ],
    },
    {
      title: "Survey Directory",
      url: "#",
      items: [
        {
          title: "Survey Management",
          url: "/survey",
          icon: ClipboardList,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const isDashboardActive = pathname === "/"

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-2">
          <Button 
            asChild
            variant={isDashboardActive ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
          >
            <a href="/" className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </a>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
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
                      const isActive = pathname === subItem.url
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
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
