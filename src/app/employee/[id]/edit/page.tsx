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
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Employee = {
  id: string
  name: string
  email: string
  role: string
  unit: string
  unitId: string
  phone: string
}

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    unit: "",
    unitId: "",
    phone: "",
  })

  // Mock data untuk simulasi fetch employee
  useEffect(() => {
    const fetchEmployee = async () => {
      setIsLoadingData(true)
      try {
        // Simulasi API call untuk get employee by ID
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock data berdasarkan ID
        const mockEmployee: Employee = {
          id: params.id as string,
          name: "Mrs. Ara Wunsch",
          email: "amelie.schuppe@example.org",
          role: "Tracer_team",
          unit: "Institutional",
          unitId: "INST001",
          phone: "0808",
        }
        
        setFormData({
          name: mockEmployee.name,
          email: mockEmployee.email,
          role: mockEmployee.role,
          unit: mockEmployee.unit,
          unitId: mockEmployee.unitId,
          phone: mockEmployee.phone,
        })
      } catch (error) {
        console.error('Error fetching employee:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (params.id) {
      fetchEmployee()
    }
  }, [params.id])

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
      // Implementasi API call untuk update employee
      console.log('Update employee:', formData)
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect kembali ke employee list
      router.push('/employee')
    } catch (error) {
      console.error('Error updating employee:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setIsLoading(true)
      try {
        // Implementasi API call untuk delete employee
        console.log('Delete employee:', params.id)
        
        // Simulasi API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Redirect kembali ke employee list
        router.push('/employee')
      } catch (error) {
        console.error('Error deleting employee:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isLoadingData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Loading...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/employee">Employee Directory</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Employee Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-8">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold tracking-tight">{formData.name}</div>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                  <CardDescription>
                    Update the employee details below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field>
                        <Label htmlFor="name">Name *</Label>
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
                        <Label htmlFor="email">Email *</Label>
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
                            <SelectItem value="Tracer_team">Tracer Team</SelectItem>
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
                            <SelectItem value="Institutional">Institutional</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field className="md:col-span-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </Field>
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? "Saving..." : "Save changes"}
                      </Button>
                      <Link href="/employee">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Metadata Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                  <CardDescription>
                    Employee creation and modification details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created at</Label>
                    <p className="text-sm mt-1">10 months ago</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last modified at</Label>
                    <p className="text-sm mt-1">2 months ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}