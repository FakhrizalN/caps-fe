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
import { Spinner } from "@/components/ui/spinner"
import { Answer, getAnswers, getCurrentUserFromAPI, getSurvey } from "@/lib/api"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
  const [programStudyId, setProgramStudyId] = useState<string | undefined>(undefined)
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        if (!surveyId || isNaN(surveyId)) {
          throw new Error("Invalid survey ID")
        }

        // Get current user from API to get program_study
        const currentUser = await getCurrentUserFromAPI()
        const userRoleName = currentUser.role || ""
        const userProgramStudy = currentUser.program_study
        
        // Set userRole state
        setUserRole(userRoleName)
        
        console.log("🔍 Response Page - User Info:")
        console.log("  - User Role:", userRoleName)
        console.log("  - Program Study:", userProgramStudy)
        
        if (userProgramStudy) {
          setProgramStudyId(userProgramStudy.toString())
        } else {
          console.warn("⚠️ No program_study found in user data")
          setProgramStudyId("1")
        }

        // Fetch survey title
        const survey = await getSurvey(surveyId.toString())
        setSurveyTitle(survey.title)

        const answers: Answer[] = await getAnswers(surveyId)
        console.log("📊 Total answers fetched:", answers.length)
        console.log("📋 Sample answer structure:", answers[0])

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
        console.log("👥 Unique users:", userList.length)
        setResponses(userList)
      } catch (err) {
        console.error("❌ Error fetching responses:", err)
        toast.error(
          err instanceof Error ? err.message : "Gagal mengambil data responses",
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (surveyId) fetchData()
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
          userRole={userRole}
          onPublish={() => console.log("Publish")}
        />
        
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
          <div className="w-full space-y-3">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Spinner className="size-8" />
              </div>
            )}
            
            {!isLoading && responses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Belum ada responses</p>
              </div>
            )}
            
            {!isLoading && responses.length > 0 && (
              <ResponseListTable data={responses} surveyId={surveyId} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
