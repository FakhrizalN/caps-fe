"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionToolbar } from "@/components/question_toolbar"
import { ResponseAnswerCard, ResponseAnswer } from "@/components/response_answer_card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
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
                <select 
                  value={currentId}
                  onChange={(e) => router.push(`/response/${e.target.value}`)}
                  className="w-[200px] px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  {mockResponses.map((r) => (
                    <option key={r.id} value={r.id}>{r.nama}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex <= 1}
                    className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    {currentIndex} dari {mockResponses.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex >= mockResponses.length}
                    className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => console.log("Delete")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  <span>🗑</span> Delete
                </button>
                <button 
                  onClick={() => console.log("Export")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <span>⬇</span> Export
                </button>
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
