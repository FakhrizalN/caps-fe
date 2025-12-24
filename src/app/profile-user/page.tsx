'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { changePassword, getCurrentUserFromAPI, patchCurrentUserProfile } from "@/lib/api"
import { Home, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


export default function ProfileUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [userName, setUserName] = useState('')

  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    phone_number: '',
    address: '',
  })

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data from API
        const userData = await getCurrentUserFromAPI()
        setFormData({
          id: userData.id || '',
          username: userData.username || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          address: userData.address || '',
        })
        setUserName(userData.username || 'User')
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user data')
        // If unauthorized, redirect to login
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
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
      await patchCurrentUserProfile({
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
      })

      setSuccessMessage('Profile updated successfully!')
      
      // Refresh page after 1 second
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      return
    }

    // Validate password length
    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsSaving(true)

    try {
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      })

      setSuccessMessage('Password changed successfully!')
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })
      setShowPasswordForm(false)
    } catch (err) {
      console.error('Error changing password:', err)
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // Clear cookies
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    // Redirect to login using replace to prevent back navigation
    router.replace('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{userName}</span>
                <span className="text-xs text-muted-foreground">Alumni</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => router.push('/dashboard-mobile')}>
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => router.push('/profile-user')}>
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="border-b bg-background">
            <div className="flex h-16 items-center gap-4 px-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Profile</h1>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-secondary/50 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                  {successMessage}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading profile...</div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold tracking-tight">My Profile</div>
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>
                        Manage your password and security settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!showPasswordForm ? (
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPasswordForm(true)}
                        >
                          Change Password
                        </Button>
                      ) : (
                        <form onSubmit={handlePasswordSubmit}>
                          <div className="grid grid-cols-1 gap-6">
                            <Field>
                              <Label htmlFor="old_password">Current Password</Label>
                              <Input
                                id="old_password"
                                name="old_password"
                                type="password"
                                placeholder="Enter current password"
                                value={passwordData.old_password}
                                onChange={handlePasswordChange}
                                required
                              />
                            </Field>

                            <Field>
                              <Label htmlFor="new_password">New Password</Label>
                              <Input
                                id="new_password"
                                name="new_password"
                                type="password"
                                placeholder="Enter new password (min. 8 characters)"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                required
                              />
                            </Field>

                            <Field>
                              <Label htmlFor="confirm_password">Confirm New Password</Label>
                              <Input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                placeholder="Confirm new password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                required
                              />
                            </Field>

                            <div className="flex gap-2">
                              <Button 
                                type="submit" 
                                disabled={isSaving}
                              >
                                {isSaving ? "Changing..." : "Change Password"}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setShowPasswordForm(false)
                                  setPasswordData({
                                    old_password: '',
                                    new_password: '',
                                    confirm_password: '',
                                  })
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}