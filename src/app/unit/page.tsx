import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar"
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
import { UnitManagementClient } from "../../components/unit-management-client"

// Sample data untuk Fakultas
async function getFakultasData() {
  return [
    {
      id: "1",
      name: "Fakultas Sains dan Teknologi Informasi",
    },
    {
      id: "2", 
      name: "Fakultas Pembangunan Berkelanjutan",
    },
    {
      id: "3",
      name: "Fakultas Rekayasa dan Teknologi Industri",
    },
  ]
}

// Sample data untuk Jurusan
async function getJurusanData() {
  return [
    {
      id: "1",
      name: "Jurusan Sains dan Analitika Data",
    },
    {
      id: "2",
      name: "Jurusan Teknik Elektro, Informatika, dan Bisnis", 
    },
    {
      id: "3",
      name: "Jurusan Teknologi Kemaritiman",
    },
    {
      id: "4",
      name: "Jurusan Teknik Sipil dan Perencanaan",
    },
    {
      id: "5",
      name: "Jurusan Teknologi Industri",
    },
    {
      id: "6",
      name: "Jurusan Rekayasa Industri",
    },
  ]
}

// Sample data untuk Program Studi
async function getProdiData() {
  return [
    {
      id: "1",
      name: "Matematika",
    },
    {
      id: "2",
      name: "Ilmu Aktuaria", 
    },
    {
      id: "3",
      name: "Statistika",
    },
    {
      id: "4",
      name: "Fisika", 
    },
    {
      id: "5",
      name: "Informatika",
    },
    {
      id: "6",
      name: "Sistem Informasi",
    },
  ]
}

export default async function UnitManagementPage() {
  const fakultasData = await getFakultasData()
  const jurusanData = await getJurusanData()
  const prodiData = await getProdiData()

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar at the top */}
      <Navbar />
      
      {/* Sidebar and main content below navbar */}
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
                jurusanData={jurusanData}
                prodiData={prodiData}
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}