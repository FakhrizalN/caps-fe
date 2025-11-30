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
import { createUser, getProgramStudies, getRoles, type CreateUserData, type ProgramStudy, type Role } from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AddEmployeePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [programStudies, setProgramStudies] = useState<ProgramStudy[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CreateUserData>({
    id: "",
    username: "", // fullname
    password: "",
    email: "",
    role: undefined,
    program_study: undefined,
    address: "",
    phone_number: "",
    last_survey: "none",
  })

  useEffect(() => {
    fetchRoles()
    fetchProgramStudies()
  }, [])

  const fetchRoles = async () => {
    try {
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      console.error("Error fetching roles:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch roles")
    }
  }

  const fetchProgramStudies = async () => {
    try {
      const data = await getProgramStudies()
      setProgramStudies(data)
    } catch (err) {
      console.error("Error fetching program studies:", err)
      // Don't set error for program studies, it's optional
    }
  }

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
      [name]: name === "role" ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await createUser(formData)
      router.push('/employee')
    } catch (err) {
      console.error('Error adding employee:', err)
      setError(err instanceof Error ? err.message : "Failed to create user")
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
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold tracking-tight">Add New Employee</div>
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
                  <Label htmlFor="id">User ID</Label>
                  <Input
                    id="id"
                    name="id"
                    type="text"
                    placeholder="Enter user ID (e.g., employee number)"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="username">Full Name</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.username}
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
                  />
                </Field>

                <Field>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role?.toString()} 
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <Label htmlFor="program_study">Program Study</Label>
                  <Select 
                    value={formData.program_study?.toString()} 
                    onValueChange={(value) => handleSelectChange("program_study", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program study" />
                    </SelectTrigger>
                    <SelectContent>
                      {programStudies.map((prodi) => (
                        <SelectItem key={prodi.id} value={prodi.id.toString()}>
                          {prodi.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="+62 812-3456-7890"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                  />
                </Field>

                <Field>
                  <Label htmlFor="last_survey">Last Survey</Label>
                  <Select 
                    value={formData.last_survey} 
                    onValueChange={(value) => handleSelectChange("last_survey", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select last survey" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="exit">Exit</SelectItem>
                      <SelectItem value="lv1">Level 1</SelectItem>
                      <SelectItem value="lv2">Level 2</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}