"use client"

import { AppSidebar } from "@/components/app-sidebar"
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
import { getUsers, type User } from "@/lib/api"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { columns, type Employee } from "./columns"
import { DataTable } from "./data-table"

export default function EmployeePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const users = await getUsers()
      
      // Convert User API format to Employee format
      const formattedEmployees: Employee[] = users.map((user: User) => ({
        id: user.id,
        name: user.username || 'N/A', // username adalah fullname
        email: user.email || 'N/A',
        role: user.role_name || 'N/A',
        unit: user.program_study_name || 'N/A',
        unitId: user.program_study?.toString() || 'N/A',
        phone: user.phone_number || 'N/A',
      }))
      
      setEmployees(formattedEmployees)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      
      // If unauthorized, redirect to login
      if (err instanceof Error && err.message.includes('Session expired')) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

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
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading users...</div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold tracking-tight">User Management</div>
                    <Link href="/employee/add">
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Employee
                      </Button>
                    </Link>
                  </div>
                  <DataTable columns={columns} data={employees} />
                </>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}