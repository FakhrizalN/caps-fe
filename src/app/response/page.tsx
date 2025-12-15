"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getProgramStudiesDetailed, getUsers, type ProgramStudyDetailed, type User } from "@/lib/api"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { useEffect, useState } from "react"

// Helper function to calculate progress percentage
function calculateProgress(lastSurvey: string | undefined): number {
  if (!lastSurvey || lastSurvey === 'none') {
    return 0
  }
  
  if (lastSurvey === 'exit') {
    return 33
  } else if (lastSurvey === 'lv1') {
    return 66
  } else if (lastSurvey === 'lv2') {
    return 100
  }
  
  return 0
}

// Helper function to get progress label
function getProgressLabel(lastSurvey: string | undefined): string {
  if (!lastSurvey || lastSurvey === 'none') {
    return 'None'
  }
  
  if (lastSurvey === 'exit') {
    return 'Exit Survey'
  } else if (lastSurvey === 'lv1') {
    return 'Tracer Lvl 1'
  } else if (lastSurvey === 'lv2') {
    return 'Tracer Lvl 2'
  }
  
  return 'None'
}

interface UserWithDetails extends User {
  faculty_name?: string
  department_name?: string
  program_study_name?: string
}

export default function ResponsesPage() {
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersData, programStudiesData] = await Promise.all([
          getUsers(),
          getProgramStudiesDetailed()
        ])
        
        // Merge program study details with user data
        const usersWithDetails: UserWithDetails[] = usersData.map((user: User) => {
          const programStudy = programStudiesData.find((ps: ProgramStudyDetailed) => ps.id === Number(user.program_study))
          
          return {
            ...user,
            program_study_name: programStudy?.name || '-',
            faculty_name: programStudy?.faculty_name || '-',
            department_name: programStudy?.department_name || '-',
          }
        })
        

        setUsers(usersWithDetails)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.id?.toLowerCase().includes(searchLower) ||
      user.program_study_name?.toLowerCase().includes(searchLower) ||
      user.faculty_name?.toLowerCase().includes(searchLower) ||
      user.department_name?.toLowerCase().includes(searchLower)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  )

  // Reset to first page when search changes
  useEffect(() => {
    setPageIndex(0)
  }, [searchQuery])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Response Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="flex flex-1 flex-col gap-8 p-8">
          <div className="text-3xl font-bold tracking-tight">Response Data</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px] pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Program Studi</TableHead>
                    <TableHead className="w-[200px]">Survey Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Tidak ada data yang cocok' : 'Tidak ada data user'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => {
                      const progress = calculateProgress(user.last_survey)
                      const label = getProgressLabel(user.last_survey)
                      return (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email || '-'}</TableCell>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.faculty_name}</TableCell>
                          <TableCell>{user.department_name}</TableCell>
                          <TableCell>{user.program_study_name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={progress} />
                              <span className="text-xs text-muted-foreground">
                                {label}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="w-full flex items-center justify-between px-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm hidden sm:block">
                  Showing {pageIndex * pageSize + 1} to{" "}
                  {Math.min((pageIndex + 1) * pageSize, filteredUsers.length)} of{" "}
                  {filteredUsers.length} result(s)
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium hidden sm:block">Rows per page</p>
                    <Select
                      value={`${pageSize}`}
                      onValueChange={(value) => {
                        setPageSize(Number(value))
                        setPageIndex(0)
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pageSize} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 25, 30, 40, 50].map((size) => (
                          <SelectItem key={size} value={`${size}`}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="hidden size-8 lg:flex"
                      onClick={() => setPageIndex(0)}
                      disabled={pageIndex === 0}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setPageIndex(pageIndex - 1)}
                      disabled={pageIndex === 0}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft />
                    </Button>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {pageIndex + 1} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setPageIndex(pageIndex + 1)}
                      disabled={pageIndex >= totalPages - 1}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hidden size-8 lg:flex"
                      onClick={() => setPageIndex(totalPages - 1)}
                      disabled={pageIndex >= totalPages - 1}
                    >
                      <span className="sr-only">Go to last page</span>
                      <ChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
