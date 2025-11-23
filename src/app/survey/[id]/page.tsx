"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionCardGForm, QuestionData } from "@/components/question_card_gform"
import { QuestionFloatingToolbar } from "@/components/question_floating_toolbar"
import { QuestionHeaderCard } from "@/components/question_header_card"
import { QuestionToolbar } from "@/components/question_toolbar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
    createQuestion,
    createSection,
    deleteQuestion,
    getQuestions,
    getSections,
    getSurvey,
    Question,
    Section,
    updateQuestion,
} from "@/lib/api"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface SectionWithQuestions extends Section {
  questions: Question[]
}

export default function SurveyQuestionsPage() {
  const params = useParams()
  const surveyId = parseInt(params.id as string)

  const [sections, setSections] = useState<SectionWithQuestions[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [surveyTitle, setSurveyTitle] = useState("Loading...")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [pendingQuestions, setPendingQuestions] = useState<Set<string>>(new Set())

  // Fetch survey data and sections
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch survey details
        const survey = await getSurvey(surveyId)
        setSurveyTitle(survey.title)
        setSurveyDescription(survey.description || "")

        // Fetch sections
        let sectionsData = await getSections(surveyId)
        
        // If no sections exist, create a default one
        if (sectionsData.length === 0) {
          const defaultSection = await createSection(surveyId, {
            title: "Default Section",
            description: "",
            order: 1
          })
          sectionsData = [defaultSection]
        }
        
        // Fetch questions for each section
        const sectionsWithQuestions = await Promise.all(
          sectionsData.map(async (section) => {
            const questions = await getQuestions(surveyId, section.id)
            return { ...section, questions }
          })
        )
        
        setSections(sectionsWithQuestions)

        // If no questions exist, create a default one
        if (sectionsWithQuestions[0] && sectionsWithQuestions[0].questions.length === 0) {
          const defaultQuestion = await createQuestion(surveyId, sectionsWithQuestions[0].id, {
            text: "Untitled question",
            question_type: "radio",
            options: [{ id: "1", label: "Option 1" }],
            description: "",
            order: 1,
            is_required: false
          })
          
          setSections([{
            ...sectionsWithQuestions[0],
            questions: [defaultQuestion]
          }])
        }
      } catch (error) {
        console.error("Error fetching survey data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [surveyId])

  const handleAddQuestion = () => {
    // Use the first (default) section
    const defaultSection = sections[0]
    if (!defaultSection) return

    // Create temporary question with temp ID
    const tempId = `temp-${Date.now()}`
    const tempQuestion: Question = {
      id: tempId as any, // Temporary ID
      text: "Untitled question",
      question_type: "radio",
      options: [{ id: "1", label: "Option 1" }],
      description: "",
      order: defaultSection.questions.length + 1,
      is_required: false,
      section_id: defaultSection.id
    }

    // Add to pending set
    setPendingQuestions(prev => new Set(prev).add(tempId))

    // Immediately show in UI
    setSections(prevSections => prevSections.map(s => 
      s.id === defaultSection.id 
        ? { ...s, questions: [...s.questions, tempQuestion] }
        : s
    ))

    // Save to DB after delay
    setTimeout(async () => {
      try {
        const newQuestion = await createQuestion(surveyId, defaultSection.id, {
          text: "Untitled question",
          question_type: "radio",
          options: [{ id: "1", label: "Option 1" }],
          description: "",
          order: defaultSection.questions.length + 1,
          is_required: false
        })

        // Replace temp question with real one
        setSections(prevSections => prevSections.map(s => 
          s.id === defaultSection.id 
            ? { 
                ...s, 
                questions: s.questions.map(q => 
                  q.id === tempId ? newQuestion : q
                )
              }
            : s
        ))

        // Remove from pending
        setPendingQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
      } catch (error) {
        console.error("Error creating question:", error)
        alert("Failed to create question")
        
        // Remove temp question on error
        setSections(prevSections => prevSections.map(s => 
          s.id === defaultSection.id 
            ? { ...s, questions: s.questions.filter(q => q.id !== tempId) }
            : s
        ))
        setPendingQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
      }
    }, 500) // 500ms delay
  }

  const handleUpdateQuestion = async (question: Question) => {
    try {
      const defaultSection = sections[0]
      if (!defaultSection) return

      // Skip update for temporary questions (they haven't been saved yet)
      if (typeof question.id === 'string' && question.id.startsWith('temp-')) {
        // Just update in local state
        setSections(sections.map(s => 
          s.id === defaultSection.id
            ? { ...s, questions: s.questions.map(q => q.id === question.id ? question : q) }
            : s
        ))
        return
      }

      const updatedQuestion = await updateQuestion(surveyId, defaultSection.id, question.id as number, {
        text: question.text,
        question_type: question.question_type,
        options: question.options,
        description: question.description,
        is_required: question.is_required
      })

      setSections(sections.map(s => 
        s.id === defaultSection.id
          ? { ...s, questions: s.questions.map(q => q.id === question.id ? updatedQuestion : q) }
          : s
      ))
    } catch (error) {
      console.error("Error updating question:", error)
      alert("Failed to update question")
    }
  }

  const handleDeleteQuestion = async (questionId: number | string) => {
    try {
      const defaultSection = sections[0]
      if (!defaultSection) return

      // If it's a temporary question, just remove from UI
      if (typeof questionId === 'string' && questionId.startsWith('temp-')) {
        setSections(sections.map(s => 
          s.id === defaultSection.id
            ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
            : s
        ))
        setPendingQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(questionId)
          return newSet
        })
        return
      }

      await deleteQuestion(surveyId, defaultSection.id, questionId as number)
      setSections(sections.map(s => 
        s.id === defaultSection.id
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      ))
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Failed to delete question")
    }
  }

  const handleDuplicateQuestion = async (questionId: number | string) => {
    try {
      const defaultSection = sections[0]
      const question = defaultSection?.questions.find(q => q.id === questionId)
      if (!question || !defaultSection) return

      // Can't duplicate temporary questions
      if (typeof questionId === 'string' && questionId.startsWith('temp-')) {
        alert("Please wait for the question to be saved before duplicating")
        return
      }

      const duplicate = await createQuestion(surveyId, defaultSection.id, {
        text: `${question.text} (Copy)`,
        question_type: question.question_type,
        options: question.options,
        description: question.description,
        order: question.order + 1,
        is_required: question.is_required
      })

      setSections(sections.map(s => 
        s.id === defaultSection.id
          ? { 
              ...s, 
              questions: [
                ...s.questions.slice(0, s.questions.findIndex(q => q.id === questionId) + 1),
                duplicate,
                ...s.questions.slice(s.questions.findIndex(q => q.id === questionId) + 1)
              ]
            }
          : s
      ))
    } catch (error) {
      console.error("Error duplicating question:", error)
      alert("Failed to duplicate question")
    }
  }

  // Mapping between frontend type names and backend type names
  const QUESTION_TYPE_MAPPING = {
    // Frontend -> Backend
    'short_answer': 'text',
    'paragraph': 'text',
    'multiple_choice': 'radio',
    'checkbox': 'checkbox',
    'dropdown': 'dropdown',
    'linear_scale': 'scale',
  } as const

  const REVERSE_TYPE_MAPPING = {
    // Backend -> Frontend
    'text': 'short_answer',
    'number': 'short_answer',
    'radio': 'multiple_choice',
    'checkbox': 'checkbox',
    'scale': 'linear_scale',
    'dropdown': 'dropdown',
  } as const

  // Convert backend format to frontend format
  const backendToFrontendType = (backendType: string): string => {
    return REVERSE_TYPE_MAPPING[backendType as keyof typeof REVERSE_TYPE_MAPPING] || backendType
  }

  // Convert frontend format to backend format
  const frontendToBackendType = (frontendType: string): string => {
    return QUESTION_TYPE_MAPPING[frontendType as keyof typeof QUESTION_TYPE_MAPPING] || frontendType
  }

  // Convert Question to QuestionData format
  const questionToQuestionData = (question: Question): QuestionData => {
    // Parse options from JSON string if needed
    let parsedOptions = question.options
    if (typeof question.options === 'string') {
      try {
        parsedOptions = JSON.parse(question.options)
        
        // Validate and fix malformed options
        if (Array.isArray(parsedOptions)) {
          parsedOptions = parsedOptions.map((opt, idx) => {
            // Fix if option is malformed (has numeric keys like {"0":"t","1":"e",...})
            if (opt && typeof opt === 'object' && !opt.id) {
              // Try to reconstruct from keys or use default
              const label = opt.label || `Option ${idx + 1}`
              return {
                id: `${idx + 1}`,
                label: label
              }
            }
            // Ensure id and label exist
            return {
              id: opt.id || `${idx + 1}`,
              label: opt.label || `Option ${idx + 1}`,
              isOther: opt.isOther || false
            }
          })
        } else {
          // If not an array, create default option
          parsedOptions = [{ id: '1', label: 'Option 1' }]
        }
      } catch (e) {
        console.error('Failed to parse options:', e, question.options)
        parsedOptions = [{ id: '1', label: 'Option 1' }]
      }
    } else if (!parsedOptions || !Array.isArray(parsedOptions)) {
      // If options is null/undefined or not an array, create default
      parsedOptions = [{ id: '1', label: 'Option 1' }]
    }
    
    return {
      id: question.id.toString(),
      type: backendToFrontendType(question.question_type),
      title: question.text,
      description: question.description || "",
      required: question.is_required,
      options: parsedOptions,
      code: question.code,
      source: question.source
    }
  }

  // Convert QuestionData back to Question format
  const questionDataToQuestion = (questionData: QuestionData, sectionId: number): Question => {
    // Handle temporary IDs (string starting with 'temp-')
    const questionId = questionData.id.startsWith('temp-') 
      ? questionData.id as any 
      : parseInt(questionData.id)
    
    return {
      id: questionId,
      text: questionData.title,
      question_type: frontendToBackendType(questionData.type),
      options: questionData.options, // Will be stringified in API call
      code: questionData.code,
      source: questionData.source,
      description: questionData.description,
      order: 0, // Will be set properly by backend
      is_required: questionData.required,
      section_id: sectionId
    }
  }

  const handlePublish = () => {
    console.log("Survey published!")
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p>Loading survey...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Get all questions from the first (default) section
  const allQuestions = sections[0]?.questions || []
  const totalQuestions = allQuestions.length
  const requiredQuestions = allQuestions.filter(q => q.is_required).length

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
                <BreadcrumbPage>{surveyTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        {/* Question Toolbar */}
        <QuestionToolbar 
          title={surveyTitle}
          activeTab="questions"
          surveyId={surveyId.toString()}
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
              {allQuestions.map((question, index) => {
                const isPending = typeof question.id === 'string' && pendingQuestions.has(question.id)
                return (
                  <div key={question.id} className="relative">
                    {!isPreviewMode && (
                      <div className="absolute -left-8 top-4 text-sm text-gray-400">
                        {index + 1}
                      </div>
                    )}
                    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
                      <QuestionCardGForm
                        question={questionToQuestionData(question)}
                        isEditMode={!isPreviewMode}
                        onUpdate={(updatedQuestionData) => {
                          const updatedQuestion = questionDataToQuestion(updatedQuestionData, sections[0].id)
                          handleUpdateQuestion(updatedQuestion)
                        }}
                        onDelete={() => handleDeleteQuestion(question.id)}
                        onDuplicate={() => handleDuplicateQuestion(question.id)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            {totalQuestions > 0 && (
              <div className="border-t pt-4 text-sm text-gray-600">
                <span className="font-medium">{totalQuestions}</span> Total Questions · 
                <span className="font-medium ml-1">{requiredQuestions}</span> Required
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
