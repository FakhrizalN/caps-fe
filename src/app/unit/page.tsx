"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getDepartments, getFaculties, getProgramStudiesDetailed } from "@/lib/api"
import { useEffect, useState } from "react"
import { UnitManagementClient } from "../../components/unit-management-client"

export default function UnitManagementPage() {
  const [fakultasData, setFakultasData] = useState<any[]>([])
  const [jurusanData, setJurusanData] = useState<any[]>([])
  const [prodiData, setProdiData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [faculties, departments, programStudies] = await Promise.all([
          getFaculties(),
          getDepartments(),
          getProgramStudiesDetailed()
        ])
        setFakultasData(faculties)
        setJurusanData(departments)
        setProdiData(programStudies)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Academic Units</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            
            <div className="flex flex-1 flex-col gap-8 p-8">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading...</p>
                </div>
              ) : (
                <UnitManagementClient 
                  fakultasData={fakultasData}
                  jurusanData={jurusanData}
                  prodiData={prodiData}
                />
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}