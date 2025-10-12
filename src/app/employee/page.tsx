import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Plus } from "lucide-react"
import Link from "next/link"
import { columns, type Employee } from "./columns"
import { DataTable } from "./data-table"

// Sample data
async function getData(): Promise<Employee[]> {
  return [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@itk.ac.id",
      role: "Admin",
      unit: "Computer Science",
      unitId: "CS001",
      phone: "+62 812-3456-7890",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@itk.ac.id",
      role: "Staff",
      unit: "Information Technology",
      unitId: "IT001",
      phone: "+62 813-4567-8901",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@itk.ac.id",
      role: "Manager",
      unit: "Electrical Engineering",
      unitId: "EE001",
      phone: "+62 814-5678-9012",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice.brown@itk.ac.id",
      role: "Staff",
      unit: "Mechanical Engineering",
      unitId: "ME001",
      phone: "+62 815-6789-0123",
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie.wilson@itk.ac.id",
      role: "Admin",
      unit: "Civil Engineering",
      unitId: "CE001",
      phone: "+62 816-7890-1234",
    },
  ]
}

export default async function EmployeePage() {
  const data = await getData()

  return (
    <div className="flex flex-col h-screen">
      {/* <Navbar /> */}
      
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
                    <BreadcrumbPage>Employee Directory</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-8 p-8">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold tracking-tight">User Management</div>
                <Link href="/employee/add">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </Link>
              </div>
              <DataTable columns={columns} data={data} />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}