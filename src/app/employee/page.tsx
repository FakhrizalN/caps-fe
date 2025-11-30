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
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getProgramStudiesDetailed, getRoles, getUsers, type ProgramStudyDetailed, type Role, type User } from "@/lib/api"
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
  const [roles, setRoles] = useState<Role[]>([])
  const [programStudies, setProgramStudies] = useState<ProgramStudyDetailed[]>([])

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch roles and program studies first
      const [users, rolesData, programStudiesData] = await Promise.all([
        getUsers(),
        getRoles(),
        getProgramStudiesDetailed()
      ])
      
      setRoles(rolesData)
      setProgramStudies(programStudiesData)
      
      // Debug: Log data dari API
      console.log('Users from API:', users)
      console.log('Roles from API:', rolesData)
      console.log('Program Studies from API:', programStudiesData)
      if (users.length > 0) {
        console.log('Sample user data:', users[0])
      }
      
      // Convert User API format to Employee format
      const formattedEmployees: Employee[] = users.map((user: User) => {
        // Find role name by ID
        const role = rolesData.find((r: Role) => r.id === Number(user.role))
        // Find program study name by ID
        const programStudy = programStudiesData.find((ps: ProgramStudyDetailed) => ps.id === Number(user.program_study))
        
        return {
          id: user.id,
          name: user.username || 'N/A',
          email: user.email || 'N/A',
          role: role?.name || 'N/A',
          programStudy: programStudy?.name || 'N/A',
          faculty: programStudy?.faculty_name || 'N/A',
          department: programStudy?.department_name || 'N/A',
          phone: user.phone_number || 'N/A',
        }
      })
      
      console.log('Formatted employees:', formattedEmployees)
      
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
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>User Management</BreadcrumbPage>
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