"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionCardGForm, QuestionData } from "@/components/question_card_gform"
import { QuestionFloatingToolbar } from "@/components/question_floating_toolbar"
import { QuestionHeaderCard } from "@/components/question_header_card"
import { QuestionToolbar } from "@/components/question_toolbar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
    },
    {
      id: "q3",
      type: "multiple_choice",
      title: "What is your favorite color?",
      description: "Choose one option",
      required: false,
      options: [
        { id: "opt1", label: "Red" },
        { id: "opt2", label: "Blue" },
        { id: "opt3", label: "Green" }
      ]
    },
    {
      id: "q4",
      type: "linear_scale",
      title: "How would you rate the service?",
      required: true,
      minValue: 1,
      maxValue: 5,
      minLabel: "Poor",
      maxLabel: "Excellent"
    },
    {
      id: "q5",
      type: "multiple_choice",
      title: "Which day of the week do you prefer?",
      description: "Select your favorite day",
      required: false,
      options: [
        { id: "opt1", label: "Monday" },
        { id: "opt2", label: "Tuesday" },
        { id: "opt3", label: "Wednesday" },
        { id: "opt4", label: "Thursday" },
        { id: "opt5", label: "Friday" }
      ]
    },
    {
      id: "q6",
      type: "linear_scale",
      title: "On a scale of 1-10, how likely are you to recommend us?",
      required: true,
      minValue: 1,
      maxValue: 10,
      minLabel: "Not likely",
      maxLabel: "Very likely"
    },
    {
      id: "q7",
      type: "multiple_choice",
      title: "What is your age group?",
      description: "Select the range that applies",
      required: false,
      options: [
        { id: "opt1", label: "18-25" },
        { id: "opt2", label: "26-35" },
        { id: "opt3", label: "36-45" },
        { id: "opt4", label: "46+" }
      ]
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
        onImportSuccess={() => console.log("Import success")}
        onAddSection={() => console.log("Add section")}
          />
        )}
        
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="ml-0 w-full space-y-3 pr-24">
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
