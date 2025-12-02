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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteUser,
  getProgramStudies,
  getRoles,
  getUser,
  updateUser,
  type ProgramStudy,
  type Role,
  type UpdateUserData,
  type User
} from "@/lib/api"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [programStudies, setProgramStudies] = useState<ProgramStudy[]>([])
  const [userData, setUserData] = useState<User | null>(null)
  
  const [formData, setFormData] = useState<UpdateUserData>({
    username: "",
    email: "",
    password: "",
    role: undefined,
    program_study: undefined,
    address: "",
    phone_number: "",
    last_survey: "none",
    is_active: true,
  })

  useEffect(() => {
    if (params.id) {
      fetchUserData()
      fetchRoles()
      fetchProgramStudies()
    }
  }, [params.id])

  const fetchUserData = async () => {
    try {
      setIsLoadingData(true)
      const user = await getUser(params.id as string)
      setUserData(user)
      
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "", // Don't pre-fill password
        role: user.role as number | undefined,
        program_study: user.program_study as number | undefined,
        address: user.address || "",
        phone_number: user.phone_number || "",
        last_survey: user.last_survey || "none",
        is_active: user.is_active ?? true,
      })
    } catch (err) {
      console.error('Error fetching user:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to fetch user data')
      
      if (err instanceof Error && err.message.includes('Session expired')) {
        router.push('/login')
      }
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      console.error("Error fetching roles:", err)
    }
  }

  const fetchProgramStudies = async () => {
    try {
      const data = await getProgramStudies()
      setProgramStudies(data)
    } catch (err) {
      console.error("Error fetching program studies:", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "role") {
      const selectedRole = roles.find(r => r.id === parseInt(value))
      setFormData(prev => ({
        ...prev,
        role: parseInt(value),
        // Auto-fill program_study if role has program_study
        program_study: selectedRole?.program_study || prev.program_study
      }))
    } else if (name === "program_study") {
      setFormData(prev => ({
        ...prev,
        program_study: parseInt(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Only send password if it's been changed
    const updateData: UpdateUserData = { ...formData }
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password
    }

    toast.promise(
      updateUser(params.id as string, updateData).then(() => {
        router.push('/employee')
      }),
      {
        loading: "Updating user...",
        success: "User updated successfully",
        error: (err) => {
          setIsLoading(false)
          return err instanceof Error ? err.message : 'Failed to update user'
        },
      }
    )
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete user "${formData.username}"?`)) {
      setIsLoading(true)
      
      toast.promise(
        deleteUser(params.id as string).then(() => {
          router.push('/employee')
        }),
        {
          loading: "Deleting user...",
          success: "User deleted successfully",
          error: (err) => {
            setIsLoading(false)
            return err instanceof Error ? err.message : 'Failed to delete user'
          },
        }
      )
    }
  }

  if (isLoadingData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Spinner className="size-8" />
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
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/employee">User Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>User Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-8">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold tracking-tight">{formData.username || 'Edit Employee'}</div>
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
                        <Label htmlFor="username">Full Name *</Label>
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
                        <Label htmlFor="email">Email</Label>
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
                        <Label htmlFor="password">Password (leave empty to keep current)</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Enter new password"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
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
                        <Input
                          id="program_study"
                          name="program_study"
                          type="text"
                          value={(() => {
                            const selectedProdi = programStudies.find(p => p.id === formData.program_study);
                            return selectedProdi?.name || "";
                          })()}
                          placeholder="-"
                          disabled={true}
                        />
                      </Field>

                      {(() => {
                        const selectedRole = roles.find(r => r.id === formData.role);
                        return selectedRole?.name === "Alumni" ? (
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
                        ) : null;
                      })()}

                      <Field className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          placeholder="Enter address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
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
                    <Label className="text-sm font-medium text-muted-foreground">NIM / NIP</Label>
                    <p className="text-sm mt-1">{userData?.id || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <p className="text-sm mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formData.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date Joined</Label>
                    <p className="text-sm mt-1">
                      {userData?.date_joined 
                        ? new Date(userData.date_joined).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                    <p className="text-sm mt-1">
                      {userData?.last_login 
                        ? new Date(userData.last_login).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Never'}
                    </p>
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