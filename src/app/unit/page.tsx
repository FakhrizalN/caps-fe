import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getFaculties, getProgramStudiesDetailed } from "@/lib/api"
import { UnitManagementClient } from "../../components/unit-management-client"

// Fetch Fakultas data from API
async function getFakultasData() {
  try {
    return await getFaculties()
  } catch (error) {
    console.error('Error fetching faculties:', error)
    return []
  }
}

// Fetch Program Studi data from API
async function getProdiData() {
  try {
    return await getProgramStudiesDetailed()
  } catch (error) {
    console.error('Error fetching program studies:', error)
    return []
  }
}

export default async function UnitManagementPage() {
  const fakultasData = await getFakultasData()
  const prodiData = await getProdiData()

  return (
    <div className="flex flex-col h-screen">
      {/* <Navbar /> */}
      
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 !h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Unit Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            
            <div className="flex flex-1 flex-col gap-8 p-8">
              <UnitManagementClient 
                fakultasData={fakultasData}
                prodiData={prodiData}
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}