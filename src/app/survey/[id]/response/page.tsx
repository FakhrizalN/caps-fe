"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionToolbar } from "@/components/question_toolbar"
import { ResponseData, ResponseListTable } from "@/components/response_list_table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Answer, getAnswers, getCurrentUser, getSurvey } from "@/lib/api"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface UniqueUser {
  id: string
  nama: string
  email: string
  nim: string
}

export default function ResponsesPage() {
  const params = useParams()
  const surveyId = Number(params?.id)
  
  const [responses, setResponses] = useState<ResponseData[]>([])
  const [surveyTitle, setSurveyTitle] = useState("Loading...")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [programStudyId, setProgramStudyId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError("")

        if (!surveyId || isNaN(surveyId)) {
          throw new Error("Invalid survey ID")
        }

        // Fetch survey title
        const survey = await getSurvey(surveyId.toString())
        setSurveyTitle(survey.title)

        const answers: Answer[] = await getAnswers(surveyId)

        const uniqueUsers = new Map<string, UniqueUser>()
        
        answers.forEach(answer => {
          if (!uniqueUsers.has(answer.user_id)) {
            uniqueUsers.set(answer.user_id, {
              id: answer.user_id,
              nama: answer.user_username,
              email: answer.user_email,
              nim: answer.user_id,
            })
          }
        })

        const userList: ResponseData[] = Array.from(uniqueUsers.values())
        setResponses(userList)
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error ? err.message : "Gagal mengambil data responses",
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (surveyId) fetchData()
    
    // Get program study ID from user
    const user = getCurrentUser()
    console.log("Response page - Current user:", user)
    if (user?.program_study) {
      console.log("Response page - Setting programStudyId to:", user.program_study)
      setProgramStudyId(user.program_study.toString())
    } else {
      console.warn("Response page - No program_study found, using default: 1")
      setProgramStudyId("1")
    }
  }, [surveyId])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <Breadcrumb>
            <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/survey">Survey Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{surveyTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <QuestionToolbar 
          title={`${surveyTitle}`}
          activeTab="responses"
          surveyId={surveyId.toString()}
          programStudyId={programStudyId}
          onPublish={() => console.log("Publish")}
        />
        
        <div className="p-6 bg-gray-50 min-h-screen pt-12">
          <div className="ml-0 w-full space-y-3 pr-20">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <p className="text-gray-500">Loading responses...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {!isLoading && !error && responses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Belum ada responses</p>
              </div>
            )}
            
            {!isLoading && !error && responses.length > 0 && (
              <ResponseListTable data={responses} surveyId={surveyId} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
