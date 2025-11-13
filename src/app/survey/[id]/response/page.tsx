"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionToolbar } from "@/components/question_toolbar"
import { ResponseData, ResponseListTable } from "@/components/response_list_table"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useParams } from "next/navigation"


const mockResponses: ResponseData[] = [
  { id: "1", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "2", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "3", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "4", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "5", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
]

export default function ResponsesPage() {
  const params = useParams()
  const surveyId = params.id as string

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
                <BreadcrumbPage>Survey {surveyId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <QuestionToolbar 
          title={`Survey ${surveyId}`}
          activeTab="responses"
          surveyId={surveyId}
          onPublish={() => console.log("Publish")}
        />
        
        <div className="p-6 bg-gray-50 min-h-screen pt-24">
          <div className="max-w-6xl ml-0 w-full space-y-3 pr-20">
            <ResponseListTable data={mockResponses} surveyId={surveyId} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
