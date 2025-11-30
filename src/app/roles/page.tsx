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
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    createRole,
    deleteRole,
    getRoles,
    updateRole,
    type CreateRoleData,
    type Role,
    type UpdateRoleData,
} from "@/lib/api"
import { Edit, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function RoleManagementPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  // Form state for add
  const [newRole, setNewRole] = useState<CreateRoleData>({
    name: "",
    description: "",
    permissions: [],
  })

  // Form state for edit
  const [editFormData, setEditFormData] = useState<UpdateRoleData>({
    name: "",
    description: "",
    permissions: [],
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      console.error("Error fetching roles:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch roles")

      if (err instanceof Error && err.message.includes("Session expired")) {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRole = async () => {
    try {
      setError(null)
      await createRole(newRole)
      setIsAddDialogOpen(false)
      setNewRole({
        name: "",
        description: "",
        permissions: [],
      })
      await fetchRoles()
    } catch (err) {
      console.error("Error creating role:", err)
      setError(err instanceof Error ? err.message : "Failed to create role")
    }
  }

  const handleEditRole = async () => {
    if (!editingRole) return

    try {
      setError(null)
      await updateRole(editingRole.id, editFormData)
      setIsEditDialogOpen(false)
      setEditingRole(null)
      await fetchRoles()
    } catch (err) {
      console.error("Error updating role:", err)
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  const handleDeleteRole = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete role "${name}"?`)) {
      try {
        setError(null)
        await deleteRole(id)
        await fetchRoles()
      } catch (err) {
        console.error("Error deleting role:", err)
        setError(err instanceof Error ? err.message : "Failed to delete role")
      }
    }
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setEditFormData({
      name: role.name,
      description: role.description,
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
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Role Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <div className="flex flex-1 flex-col gap-8 p-8 overflow-auto">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

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
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                          id="name"
                          value={newRole.name}
                          onChange={(e) =>
                            setNewRole({ ...newRole, name: e.target.value })
                          }
                          placeholder="e.g., Administrator, Staff, Manager"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newRole.description}
                          onChange={(e) =>
                            setNewRole({
                              ...newRole,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe the role and its responsibilities"
                          rows={3}
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
                  <div className="text-gray-500">Loading roles...</div>
                </div>
              ) : (
                <>
                  {/* Roles Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-gray-500"
                            >
                              No roles found. Add a new role to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          roles.map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">
                                {role.name}
                              </TableCell>
                              <TableCell>{role.description || "N/A"}</TableCell>
                              <TableCell>
                                {role.created_at
                                  ? new Date(role.created_at).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(role)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteRole(role.id, role.name)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
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
              <Label htmlFor="edit_name">Role Name</Label>
              <Input
                id="edit_name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                rows={3}
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
