"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUserFromAPI, getSurveys, type Survey } from "@/lib/api"
import { Award, ClipboardList, FileText, Lock, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Map survey types to icons
const surveyIcons: Record<string, any> = {
  exit: FileText,
  lv1: ClipboardList,
  lv2: Award,
  skp: Users,
}

// Map survey types to friendly titles
const surveyTitles: Record<string, string> = {
  exit: "Exit Survey",
  lv1: "Tracer Study Level 1",
  lv2: "Tracer Study Level 2",
  skp: "Survey Kepuasan Pengguna",
}

// Survey progression order
const surveyOrder = ['exit', 'lv1', 'lv2']

// Helper function to check if a survey can be accessed based on last_survey progress
function canAccessSurvey(surveyType: string | undefined, lastSurvey: string | undefined): boolean {
  if (!surveyType) return true
  
  const normalizedSurveyType = surveyType.toLowerCase()
  const normalizedLastSurvey = lastSurvey?.toLowerCase() || 'none'
  
  // Exit survey can always be accessed (it's the first one)
  if (normalizedSurveyType === 'exit') {
    return true
  }
  
  // Level 1 requires exit to be completed
  if (normalizedSurveyType === 'lv1') {
    return normalizedLastSurvey === 'exit' || normalizedLastSurvey === 'lv1' || normalizedLastSurvey === 'lv2'
  }
  
  // Level 2 requires level 1 to be completed
  if (normalizedSurveyType === 'lv2') {
    return normalizedLastSurvey === 'lv1' || normalizedLastSurvey === 'lv2'
  }
  
  return true
}

// Helper function to get the required survey message
function getRequiredSurveyMessage(surveyType: string | undefined): string {
  if (!surveyType) return ''
  
  const normalizedSurveyType = surveyType.toLowerCase()
  
  if (normalizedSurveyType === 'lv1') {
    return 'Selesaikan Exit Survey terlebih dahulu'
  }
  
  if (normalizedSurveyType === 'lv2') {
    return 'Selesaikan Tracer Study Level 1 terlebih dahulu'
  }
  
  return ''
}

export function KuesionerSection() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSurvey, setLastSurvey] = useState<string | undefined>(undefined)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch surveys
        const allSurveys = await getSurveys()
        // Filter only active surveys and exclude SKP type (SKP surveys are accessed via email link)
        const activeSurveys = allSurveys.filter(survey => 
          survey.is_active && survey.survey_type?.toLowerCase() !== 'skp'
        )
        setSurveys(activeSurveys)
        
        // Check if user is logged in and fetch their progress
        const accessToken = localStorage.getItem('access_token')
        if (accessToken) {
          setIsLoggedIn(true)
          try {
            const currentUser = await getCurrentUserFromAPI()
            setLastSurvey(currentUser.last_survey || 'none')
          } catch (error) {
            console.error('Error fetching user data:', error)
            setLastSurvey('none')
          }
        }
      } catch (error) {
        console.error('Error fetching surveys:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSurveyClick = async (surveyId: string | number, surveyType?: string) => {
    console.log('Survey clicked:', { surveyId, surveyType })
    
    // For SKP surveys, navigate directly to supervisor survey page without login
    // Check case-insensitive to handle different cases
    if (surveyType?.toLowerCase() === 'skp') {
      console.log('Navigating to supervisor page for SKP survey')
      router.push(`/survey/${surveyId}/supervisor`)
      return
    }

    // Check if user is authenticated for other survey types
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      router.push('/login')
      return
    }

    // Check if user can access this survey based on progression
    if (!canAccessSurvey(surveyType, lastSurvey)) {
      toast.warning(getRequiredSurveyMessage(surveyType))
      return
    }

    // Get user data from localStorage
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

  if (loading) {
    return (
      <section id="kuesioner" className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Kuesioner</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Memuat kuesioner yang tersedia...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (surveys.length === 0) {
    return (
      <section id="kuesioner" className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Kuesioner</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tidak ada kuesioner aktif saat ini.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="kuesioner" className="py-20 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Kuesioner</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih dan isi kuesioner sesuai dengan kategori Anda. Partisipasi Anda sangat berarti untuk pengembangan
            kualitas pendidikan di ITK.
          </p>
        </div>

        <div className={`grid gap-6 ${
          surveys.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          surveys.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' :
          surveys.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto' :
          'grid-cols-1 md:grid-cols-4'
        }`}>
          {surveys.map((survey) => {
            const Icon = surveyIcons[survey.survey_type || ''] || FileText
            const canAccess = !isLoggedIn || canAccessSurvey(survey.survey_type, lastSurvey)
            const lockedMessage = getRequiredSurveyMessage(survey.survey_type)
            
            return (
              <Card 
                key={survey.id} 
                className={`bg-card border-border transition-shadow ${
                  canAccess ? 'hover:shadow-lg' : 'opacity-75'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${canAccess ? 'bg-primary/10' : 'bg-muted'}`}>
                      {canAccess ? (
                        <Icon className="h-6 w-6 text-primary" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="text-xl text-foreground">{survey.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base mb-4">
                    {survey.description}
                  </CardDescription>
                  {!canAccess && isLoggedIn && (
                    <p className="text-sm text-amber-600 mb-4 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {lockedMessage}
                    </p>
                  )}
                  <Button 
                    className={`w-full ${
                      canAccess 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                    onClick={() => handleSurveyClick(survey.id, survey.survey_type)}
                    disabled={!canAccess && isLoggedIn}
                  >
                    {canAccess ? 'Isi Kuesioner' : 'Terkunci'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
