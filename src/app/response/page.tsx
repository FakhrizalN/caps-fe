"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionToolbar } from "@/components/question_toolbar"
import { ResponseListTable, ResponseData } from "@/components/response_list_table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const mockResponses: ResponseData[] = [
  { id: "1", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "2", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "3", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "4", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
  { id: "5", nama: "Diva Rajestiadi", email: "divr@gmail.com", nim: "11221015" },
]

export default function ResponsesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <QuestionToolbar 
          title="Survey 1"
          activeTab="responses"
          onPublish={() => console.log("Publish")}
        />
        
        <div className="p-6 bg-gray-50 min-h-screen pt-24">
          <div className="max-w-6xl ml-0 w-full space-y-3 pr-20">
            <ResponseListTable data={mockResponses} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
