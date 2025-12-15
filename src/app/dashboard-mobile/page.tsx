'use client'

import { MobileSurveyCard } from "@/components/mobile-survey-card"
import { Button } from "@/components/ui/button"
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
import { getSurveys, type Survey } from "@/lib/api"
import { Home, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardMobilePage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Get user data from localStorage
    try {
      const userDataString = localStorage.getItem('user')
      if (userDataString) {
        const userData = JSON.parse(userDataString)
        setUserName(userData.username || 'User')
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }

    // Fetch active surveys
    const fetchActiveSurveys = async () => {
      try {
        const allSurveys = await getSurveys()
        const activeSurveys = allSurveys.filter(survey => survey.is_active)
        setSurveys(activeSurveys)
      } catch (error) {
        console.error('Error fetching surveys:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveSurveys()
  }, [])

  const handleSurveyClick = async (surveyId: string | number) => {
    try {
      const userDataString = localStorage.getItem('user')
      if (!userDataString) {
        router.push('/login')
        return
      }

      const userData = JSON.parse(userDataString)
      const alumniId = userData.id

      // Navigate to survey page for alumni
      router.push(`/survey/${surveyId}/alumni/${alumniId}`)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
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
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-secondary/50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Selamat Datang, {userName}!
                </h2>
                <p className="text-muted-foreground">
                  Pilih dan isi kuesioner yang tersedia di bawah ini.
                </p>
              </div>

              {/* Surveys Section */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Memuat kuesioner...</div>
                </div>
              ) : surveys.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-lg text-muted-foreground mb-2">
                    Tidak ada kuesioner aktif saat ini.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Silakan cek kembali nanti.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {surveys.map((survey) => (
                    <MobileSurveyCard
                      key={survey.id}
                      id={survey.id}
                      title={survey.title}
                      description={survey.description}
                      survey_type={survey.survey_type}
                      onClick={handleSurveyClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
