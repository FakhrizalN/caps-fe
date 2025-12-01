'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getCurrentUser, getUser, updateUser } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    phone_number: '',
    address: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = getCurrentUser()
        if (!currentUser?.id) {
          router.push('/login')
          return
        }

        // Fetch full user data from API
        const userData = await getUser(currentUser.id)
        setFormData({
          id: userData.id || '',
          username: userData.username || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          address: userData.address || '',
        })
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await updateUser(formData.id, {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
      })

      // Update localStorage with new data
      const currentUser = getCurrentUser()
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          address: formData.address,
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      setSuccessMessage('Profile updated successfully!')
      
      // Refresh page after 1 second to update sidebar
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
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
                    <BreadcrumbPage>My Profile</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-8 p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {successMessage}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading profile...</div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold tracking-tight">My Profile</div>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field>
                            <Label htmlFor="id">NIM / NIP</Label>
                            <Input
                              id="id"
                              name="id"
                              type="text"
                              value={formData.id}
                              disabled
                              className="bg-gray-50"
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
                      </form>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}
