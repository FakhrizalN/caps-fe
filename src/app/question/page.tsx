"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionCardGForm, QuestionData } from "@/components/question_card_gform"
import { QuestionHeaderCard } from "@/components/question_header_card"
import { QuestionToolbar } from "@/components/question_toolbar"
import { QuestionFloatingToolbar } from "@/components/question_floating_toolbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react"

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      id: "q1",
      type: "multiple_choice",
      title: "What is your preferred programming language?",
      description: "Select one option",
      required: true,
      options: [
        { id: "opt1", label: "JavaScript" },
        { id: "opt2", label: "TypeScript" },
        { id: "opt3", label: "Python" }
      ]
    },
    {
      id: "q2",
      type: "linear_scale",
      title: "How satisfied are you?",
      required: true,
      minValue: 1,
      maxValue: 5,
      minLabel: "Not satisfied",
      maxLabel: "Very satisfied"
    }
  ])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [surveyTitle, setSurveyTitle] = useState("Judul Survey")
  const [surveyDescription, setSurveyDescription] = useState("Description")

  const handleAddQuestion = () => {
    const newQuestion: QuestionData = {
      id: `q${Date.now()}`,
      type: "multiple_choice",
      title: "Untitled question",
      description: "",
      required: false,
      options: [{ id: "opt1", label: "Option 1" }]
    }
    setQuestions([...questions, newQuestion])
  }

  const handleUpdateQuestion = (updatedQuestion: QuestionData) => {
    setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q))
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId))
  }

  const handleDuplicateQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question) {
      const duplicate: QuestionData = {
        ...question,
        id: `q${Date.now()}`,
        title: `${question.title} (Copy)`
      }
      const index = questions.findIndex(q => q.id === questionId)
      const newQuestions = [...questions]
      newQuestions.splice(index + 1, 0, duplicate)
      setQuestions(newQuestions)
    }
  }

  const handlePublish = () => {
    console.log("Survey published!")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Question Toolbar */}
        <QuestionToolbar 
          title="Survey 1"
          activeTab="questions"
          isPreviewMode={isPreviewMode}
          onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
          onPublish={handlePublish}
        />

        {/* Floating Toolbar */}
        {!isPreviewMode && (
        <QuestionFloatingToolbar 
        onAddQuestion={handleAddQuestion}
        onAddText={() => console.log("Add text")}
        onImportQuestion={() => console.log("Import question")}
        onAddSection={() => console.log("Add section")}
          />
        )}
        
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Container: lebar max 1280px, ke kiri, kasih space kanan buat floating toolbar */}
          <div className="max-w-6xl ml-0 w-full space-y-3 pr-24">
            {/* Question Header Card */}
            <QuestionHeaderCard
              title={surveyTitle}
              description={surveyDescription}
              onTitleChange={setSurveyTitle}
              onDescriptionChange={setSurveyDescription}
            />

            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="relative">
                  {!isPreviewMode && (
                    <div className="absolute -left-8 top-4 text-sm text-gray-400">{i + 1}</div>
                  )}
                  <QuestionCardGForm
                    question={q}
                    isEditMode={!isPreviewMode}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                    onDuplicate={handleDuplicateQuestion}
                  />
                </div>
              ))}
            </div>

            {/* Summary */}
            {questions.length > 0 && (
              <div className="border-t pt-4 text-sm text-gray-600">
                <span className="font-medium">{questions.length}</span> Total Questions · 
                <span className="font-medium ml-1">{questions.filter(q => q.required).length}</span> Required
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
