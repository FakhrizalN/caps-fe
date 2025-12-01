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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createRole,
  deleteRole,
  getProgramStudies,
  getRoles,
  updateRole,
  type CreateRoleData,
  type ProgramStudy,
  type Role,
  type UpdateRoleData,
} from "@/lib/api"
import { Edit, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function RoleManagementPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [programStudies, setProgramStudies] = useState<ProgramStudy[]>([])

  // Form state for add
  const [newRole, setNewRole] = useState<CreateRoleData>({
    name: "",
    program_study: undefined,
    permissions: [],
  })

  // Form state for edit
  const [editFormData, setEditFormData] = useState<UpdateRoleData>({
    name: "",
    program_study: undefined,
    permissions: [],
  })

  useEffect(() => {
    fetchRoles()
    fetchProgramStudies()
  }, [])

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      console.error("Error fetching roles:", err)
      toast.error(err instanceof Error ? err.message : "Failed to fetch roles")

      if (err instanceof Error && err.message.includes("Session expired")) {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProgramStudies = async () => {
    try {
      const data = await getProgramStudies()
      setProgramStudies(data)
    } catch (err) {
      console.error("Error fetching program studies:", err)
      toast.error("Failed to fetch program studies")
    }
  }

  const handleCreateRole = async () => {
    // Validate required fields
    if (!newRole.program_study) {
      toast.warning("Program Study is required")
      return
    }
    if (!newRole.name || newRole.name.trim() === "") {
      toast.warning("Role Name is required")
      return
    }
    
    toast.promise(
      createRole(newRole).then(async () => {
        setIsAddDialogOpen(false)
        setNewRole({
          name: "",
          program_study: undefined,
          permissions: [],
        })
        await fetchRoles()
      }),
      {
        loading: "Creating role...",
        success: "Role created successfully",
        error: (err) => err instanceof Error ? err.message : "Failed to create role",
      }
    )
  }

  const handleEditRole = async () => {
    if (!editingRole) return

    // Validate required fields
    if (!editFormData.program_study) {
      toast.warning("Program Study is required")
      return
    }
    if (!editFormData.name || editFormData.name.trim() === "") {
      toast.warning("Role Name is required")
      return
    }
    
    toast.promise(
      updateRole(editingRole.id, editFormData).then(async () => {
        setIsEditDialogOpen(false)
        setEditingRole(null)
        await fetchRoles()
      }),
      {
        loading: "Updating role...",
        success: "Role updated successfully",
        error: (err) => err instanceof Error ? err.message : "Failed to update role",
      }
    )
  }

  const handleDeleteRole = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete role "${name}"?`)) {
      toast.promise(
        deleteRole(id).then(async () => {
          await fetchRoles()
        }),
        {
          loading: "Deleting role...",
          success: "Role deleted successfully",
          error: (err) => err instanceof Error ? err.message : "Failed to delete role",
        }
      )
    }
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setEditFormData({
      name: role.name,
      program_study: role.program_study,
      permissions: role.permissions,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-screen">
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
                    <BreadcrumbPage>Role Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <div className="flex flex-1 flex-col gap-8 p-8 overflow-auto">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                  Role Management
                </h1>

                {/* Add Role Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Role</DialogTitle>
                      <DialogDescription>
                        Create a new user role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="program_study">Program Study <span className="text-red-500">*</span></Label>
                        <Select
                          value={newRole.program_study?.toString()}
                          onValueChange={(value) => {
                            const selectedProdi = programStudies.find(p => p.id === parseInt(value));
                            setNewRole({ 
                              ...newRole, 
                              program_study: parseInt(value),
                              name: selectedProdi ? `Prodi ${selectedProdi.name}` : newRole.name
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select program study" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start" sideOffset={5}>
                            {programStudies.map((prodi) => (
                              <SelectItem key={prodi.id} value={prodi.id.toString()}>
                                {prodi.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Role Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          value={newRole.name}
                          onChange={(e) =>
                            setNewRole({ ...newRole, name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRole}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spinner className="size-8" />
                </div>
              ) : (
                <>
                  {/* Roles Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role Name</TableHead>
                          <TableHead>Program Study</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-gray-500"
                            >
                              No roles found. Add a new role to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          roles.map((role) => {
                            const isProtectedRole = ['admin', 'tracer', 'alumni', 'pimpinan unit'].includes(role.name.toLowerCase())
                            return (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">
                                {role.name}
                              </TableCell>
                              <TableCell>{role.program_study_name || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(role)}
                                    disabled={isProtectedRole}
                                  >
                                    <Edit className={`h-4 w-4 ${isProtectedRole ? 'text-gray-400' : ''}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteRole(role.id, role.name)
                                    }
                                    disabled={isProtectedRole}
                                  >
                                    <Trash2 className={`h-4 w-4 ${isProtectedRole ? 'text-gray-400' : 'text-red-600'}`} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )})
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_program_study">Program Study <span className="text-red-500">*</span></Label>
              <Select
                value={editFormData.program_study?.toString()}
                onValueChange={(value) => {
                  const selectedProdi = programStudies.find(p => p.id === parseInt(value));
                  setEditFormData({ 
                    ...editFormData, 
                    program_study: parseInt(value),
                    name: selectedProdi ? `Prodi ${selectedProdi.name}` : editFormData.name
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select program study" />
                </SelectTrigger>
                <SelectContent position="popper" align="start" sideOffset={5}>
                  {programStudies.map((prodi) => (
                    <SelectItem key={prodi.id} value={prodi.id.toString()}>
                      {prodi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_name">Role Name <span className="text-red-500">*</span></Label>
              <Input
                id="edit_name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
