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
import { createUser, getProgramStudies, getRoles, type CreateUserData, type ProgramStudy, type Role } from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function AddEmployeePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [programStudies, setProgramStudies] = useState<ProgramStudy[]>([])
  const [fieldErrors, setFieldErrors] = useState({
    id: false,
    username: false,
    email: false,
    role: false,
    phone_number: false,
    program_study: false,
  })
  
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
      toast.error(err instanceof Error ? err.message : "Failed to fetch roles")
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
    if (name === "role") {
      const selectedRole = roles.find(r => r.id === parseInt(value))
      setFormData(prev => ({
        ...prev,
        role: parseInt(value),
        // Auto-fill program_study if role has program_study
        program_study: selectedRole?.program_study || prev.program_study
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

    // Validate required fields
    let isAlumni = false;
    let isProdiProgram = false;
    const selectedRole = roles.find(r => r.id === formData.role);
    if (selectedRole && selectedRole.name.toLowerCase() === "alumni") {
      isAlumni = true;
    }
    const selectedProdi = programStudies.find(p => p.id === formData.program_study);
    if (selectedProdi && selectedProdi.name.toLowerCase().startsWith("prodi")) {
      isProdiProgram = true;
    }
    const errors = {
      id: !formData.id || formData.id.trim() === "",
      username: !formData.username || formData.username.trim() === "",
      email: !formData.email || formData.email.trim() === "",
      role: !formData.role,
      phone_number: !formData.phone_number || formData.phone_number.trim() === "",
      program_study: isAlumni && isProdiProgram && !formData.program_study,
    };

    setFieldErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(error => error)) {
      toast.warning("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true)
    toast.promise(
      createUser(formData).then(() => {
        router.push('/employee')
      }),
      {
        loading: "Creating user...",
        success: "User created successfully",
        error: (err) => {
          setIsSubmitting(false)
          return err instanceof Error ? err.message : "Failed to create user"
        },
      }
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
                <BreadcrumbPage>Add User</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-8">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold tracking-tight">Add New Employee</div>
            <div className="flex items-center gap-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex items-center gap-2"
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
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
                  <Label htmlFor="id">NIM / NIP <span className="text-red-500">*</span></Label>
                  <Input
                    id="id"
                    name="id"
                    type="text"
                    placeholder="Enter NIM / NIP"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                    className={fieldErrors.id ? "border-red-500" : ""}
                  />
                  {fieldErrors.id && (
                    <p className="text-sm text-red-500 mt-1">NIM / NIP is required</p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="username">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={fieldErrors.username ? "border-red-500" : ""}
                  />
                  {fieldErrors.username && (
                    <p className="text-sm text-red-500 mt-1">Full Name is required</p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={fieldErrors.email ? "border-red-500" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-500 mt-1">Email Address is required</p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.role?.toString()} 
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger className={fieldErrors.role ? "border-red-500" : ""}>
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
                  {fieldErrors.role && (
                    <p className="text-sm text-red-500 mt-1">Role is required</p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="program_study">
                    Program Study
                    {(() => {
                      const selectedRole = roles.find(r => r.id === formData.role);
                      const isAlumni = selectedRole && selectedRole.name.toLowerCase() === "alumni";
                      const isProdiRole = selectedRole && selectedRole.name.toLowerCase().startsWith("prodi");
                      const selectedProdi = programStudies.find(p => p.id === formData.program_study);
                      const isProdiProgram = selectedProdi && selectedProdi.name.toLowerCase().startsWith("prodi");
                      if (isAlumni || isProdiRole || isProdiProgram) {
                        return <span className="text-red-500"> *</span>;
                      }
                      return null;
                    })()}
                  </Label>
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
                    className={fieldErrors.program_study ? "border-red-500" : ""}
                  />
                  {fieldErrors.program_study && (
                    <p className="text-sm text-red-500 mt-1">Program Study is required for Alumni with Prodi program</p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="phone_number">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="081234567890"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={fieldErrors.phone_number ? "border-red-500" : ""}
                  />
                  {fieldErrors.phone_number && (
                    <p className="text-sm text-red-500 mt-1">Phone Number is required</p>
                  )}
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