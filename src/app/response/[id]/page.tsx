"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionToolbar } from "@/components/question_toolbar"
import { ResponseAnswer, ResponseAnswerCard } from "@/components/response_answer_card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

const mockResponses = [
  { id: "1", nama: "Nama 1" },
  { id: "2", nama: "Nama 2" },
  { id: "3", nama: "Nama 3" },
]

const mockAnswers: ResponseAnswer[] = [
  {
    id: "q1",
    type: "multiple_choice",
    title: "What is your preferred programming language?",
    required: true,
    options: [
      { id: "opt1", label: "JavaScript" },
      { id: "opt2", label: "TypeScript" },
      { id: "opt3", label: "Python" }
    ],
    selectedOption: "opt1",
  },
  {
    id: "q2",
    type: "checkbox",
    title: "Select all that apply",
    required: false,
    options: [
      { id: "opt1", label: "Option 1" },
      { id: "opt2", label: "Option 2" },
      { id: "opt3", label: "Option 3" }
    ],
    selectedOptions: ["opt1", "opt3"],
  },
  {
    id: "q3",
    type: "linear_scale",
    title: "How satisfied are you?",
    required: true,
    minValue: 1,
    maxValue: 5,
    minLabel: "Sangat Tidak Setuju",
    maxLabel: "Sangat Setuju",
    selectedValue: 2,
  },
  {
    id: "q4",
    type: "short_answer",
    title: "Any additional comments?",
    required: false,
    textAnswer: "This is a sample answer from the respondent.",
  },
]

export default function ResponseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const currentId = params.id as string
  
  const currentIndex = mockResponses.findIndex((r) => r.id === currentId) + 1

  const handlePrevious = () => {
    const prevIndex = currentIndex - 2
    if (prevIndex >= 0) {
      router.push(`/response/${mockResponses[prevIndex].id}`)
    }
  }

  const handleNext = () => {
    if (currentIndex < mockResponses.length) {
      router.push(`/response/${mockResponses[currentIndex].id}`)
    }
  }

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
                  <BreadcrumbPage>Survey 1</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
        {/* Toolbar - Sticky di atas */}
        <QuestionToolbar 
          title="Survey 1"
          activeTab="responses"
          onPublish={() => console.log("Publish")}
        />
        
        {/* Main Content Area dengan padding top */}
        <div className="bg-gray-50 min-h-screen">
          {/* Response Navigation - Di bawah toolbar, dalam content area */}
          <div className="bg-white border-b shadow-sm px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              {/* Left: Dropdown + Pagination */}
              <div className="flex items-center gap-4">
                <Select 
                  value={currentId}
                  onValueChange={(value) => router.push(`/response/${value}`)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select response" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockResponses.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentIndex <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-900">
                    {currentIndex} dari {mockResponses.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentIndex >= mockResponses.length}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive"
                  onClick={() => console.log("Delete")}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button 
                  onClick={() => console.log("Export")}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Question Cards */}
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-3">
              {mockAnswers.map((answer) => (
                <ResponseAnswerCard key={answer.id} answer={answer} />
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
