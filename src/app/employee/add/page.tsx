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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AddEmployeePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Personal fields
    name: "",
    email: "",
    role: "",
    unit: "",
    unitId: "",
    phone: "",
    // Module Permissions fields
    department: "",
    position: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Implementasi API call untuk menambah employee
      console.log('Add employee:', formData)
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect kembali ke employee list
      router.push('/employee')
    } catch (error) {
      console.error('Error adding employee:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/employee">Employee Directory</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add Employee</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold tracking-tight">Add New Employee</div>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="permissions">Module Permissions</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex items-center gap-2"
                  onClick={handleSubmit}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
                <Link href="/employee">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
            
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Fill in the personal details for the new employee.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => handleSelectChange("role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <Label htmlFor="unit">Unit</Label>
                      <Select 
                        value={formData.unit} 
                        onValueChange={(value) => handleSelectChange("unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <Label htmlFor="unitId">Unit ID</Label>
                      <Input
                        id="unitId"
                        name="unitId"
                        type="text"
                        placeholder="Enter unit ID (e.g., CS001)"
                        value={formData.unitId}
                        onChange={handleInputChange}
                        required
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+62 812-3456-7890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Module Permissions</CardTitle>
                  <CardDescription>
                    Set department and position for module access permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field>
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => handleSelectChange("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Academic Affairs">Academic Affairs</SelectItem>
                          <SelectItem value="Student Affairs">Student Affairs</SelectItem>
                          <SelectItem value="Research & Development">Research & Development</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Human Resources">Human Resources</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <Label htmlFor="position">Position</Label>
                      <Select 
                        value={formData.position} 
                        onValueChange={(value) => handleSelectChange("position", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Coordinator">Coordinator</SelectItem>
                          <SelectItem value="Staff">Staff</SelectItem>
                          <SelectItem value="Lecturer">Lecturer</SelectItem>
                          <SelectItem value="Professor">Professor</SelectItem>
                          <SelectItem value="Assistant">Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}