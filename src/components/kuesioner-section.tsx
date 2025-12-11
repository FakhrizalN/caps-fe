"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSurveys, type Survey } from "@/lib/api"
import { Award, ClipboardList, FileText, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

export function KuesionerSection() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveSurveys = async () => {
      try {
        const allSurveys = await getSurveys()
        // Filter only active surveys
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
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      router.push('/login')
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
            
            return (
              <Card key={survey.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{survey.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base mb-6">
                    {survey.description}
                  </CardDescription>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleSurveyClick(survey.id)}
                  >
                    Isi Kuesioner
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
