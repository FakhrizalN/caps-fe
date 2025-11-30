"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionCardGForm, QuestionData } from "@/components/question_card_gform"
import { QuestionType } from "@/components/question_content_gform"
import { QuestionFloatingToolbar } from "@/components/question_floating_toolbar"
import { QuestionToolbar } from "@/components/question_toolbar"
import { SectionHeaderCard } from "@/components/section_header_card"
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
import {
  createProgramStudyQuestion,
  deleteProgramStudyQuestion,
  getProgramStudy,
  getProgramStudyQuestions,
  getSurvey,
  ProgramStudyQuestion,
  updateProgramStudyQuestion
} from "@/lib/api"
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProgramStudyQuestionsPage() {
  const params = useParams()
  const surveyId = parseInt(params.id as string)
  const programStudyId = parseInt(params.programStudyId as string)

  const [questions, setQuestions] = useState<ProgramStudyQuestion[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [surveyTitle, setSurveyTitle] = useState("Loading...")
  const [loading, setLoading] = useState(true)
  const [pendingQuestions, setPendingQuestions] = useState<Set<string>>(new Set())
  const [activeQuestionId, setActiveQuestionId] = useState<number | string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [programStudyName, setProgramStudyName] = useState<string>("")

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex(q => q.id.toString() === active.id)
    const newIndex = questions.findIndex(q => q.id.toString() === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const draggedQuestion = questions[oldIndex]
    if (typeof draggedQuestion.id === 'string' && draggedQuestion.id.startsWith('temp-')) {
      console.log("Cannot reorder temporary question")
      return
    }

    const newQuestions = arrayMove(questions, oldIndex, newIndex).map((q, index) => ({
      ...q,
      order: index + 1
    }))
    
    setQuestions(newQuestions)
    
    try {
      const updatePromises = newQuestions
        .filter(question => typeof question.id === 'number')
        .map((question, index) =>
          updateProgramStudyQuestion(surveyId, programStudyId, question.id as number, {
            text: question.text,
            question_type: question.question_type,
            options: question.options,
            description: question.description,
            is_required: question.is_required,
            order: index + 1
          })
        )
      
      await Promise.all(updatePromises)
      console.log("Question order updated successfully")
    } catch (error) {
      console.error("Error updating question order:", error)
      alert("Failed to update question order")
      fetchQuestions()
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      
      const survey = await getSurvey(surveyId.toString())
      setSurveyTitle(survey.title)

      const questionsData = await getProgramStudyQuestions(surveyId, programStudyId)
      
      const processedQuestions = questionsData.map(q => {
        let options = q.options
        if (typeof options === 'string') {
          try {
            options = JSON.parse(options)
          } catch (e) {
            options = []
          }
        }

        if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'string') {
          options = options.map((opt: string, idx: number) => ({
            id: `${idx + 1}`,
            label: opt
          }))
        }

        return {
          ...q,
          options
        }
      })

      setQuestions(processedQuestions)
    } catch (error) {
      console.error("Error fetching questions:", error)
      alert("Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (surveyId && programStudyId) {
        await fetchQuestions()
        
        // Get program study name from API
        try {
          const programStudy = await getProgramStudy(programStudyId)
          setProgramStudyName(programStudy.name)
        } catch (error) {
          console.error("Error fetching program study:", error)
          setProgramStudyName("Program Study")
        }
      }
    }
    
    fetchData()
  }, [surveyId, programStudyId])

  const handleAddQuestion = async () => {
    const tempId = `temp-${Date.now()}`
    const newOrder = questions.length + 1

    const tempQuestion: ProgramStudyQuestion = {
      id: tempId,
      text: "Untitled question",
      question_type: "radio",
      options: [{ id: "1", label: "Option 1" }],
      order: newOrder,
      is_required: false,
      program_study: programStudyId,
      survey: surveyId
    }

    // Add temporary question to UI immediately
    setQuestions([...questions, tempQuestion])
    setPendingQuestions(prev => new Set(prev).add(tempId))
    setActiveQuestionId(tempId)

    // Save to backend immediately
    try {
      const created = await createProgramStudyQuestion(surveyId, programStudyId, {
        text: "Untitled question",
        question_type: "radio",
        options: [{ id: "1", label: "Option 1" }] as any,
        description: "",
        order: newOrder,
        is_required: false,
      })

      // Replace temp question with created question from backend
      setQuestions(prev => prev.map(q => 
        q.id === tempId ? created : q
      ))

      // Remove from pending
      setPendingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })

      // Update active ID to the created question
      setActiveQuestionId(created.id)
    } catch (error) {
      console.error("Error creating question:", error)
      alert("Failed to create question")
      
      // Remove temp question on error
      setQuestions(prev => prev.filter(q => q.id !== tempId))
      setPendingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    }
  }

  const convertToQuestionData = (q: ProgramStudyQuestion): QuestionData => {
    let type: QuestionType = "short_answer"
    
    switch (q.question_type) {
      case "text":
        type = "short_answer"
        break
      case "number":
        type = "short_answer"
        break
      case "radio":
        type = "multiple_choice"
        break
      case "checkbox":
        type = "checkbox"
        break
      case "scale":
        type = "linear_scale"
        break
      case "dropdown":
        type = "dropdown"
        break
    }

    return {
      id: q.id.toString(),
      type,
      title: q.text,
      description: q.description,
      options: q.options,
      required: q.is_required,
      code: q.code,
      source: q.source,
      minValue: type === "linear_scale" ? 1 : undefined,
      maxValue: type === "linear_scale" ? 5 : undefined,
      minLabel: type === "linear_scale" ? "Sangat Tidak Setuju" : undefined,
      maxLabel: type === "linear_scale" ? "Sangat Setuju" : undefined,
    }
  }

  const convertFromQuestionData = (qd: QuestionData): Partial<ProgramStudyQuestion> => {
    let questionType = "text"
    
    switch (qd.type) {
      case "short_answer":
      case "paragraph":
        questionType = "text"
        break
      case "multiple_choice":
        questionType = "radio"
        break
      case "checkbox":
        questionType = "checkbox"
        break
      case "linear_scale":
        questionType = "scale"
        break
      case "dropdown":
        questionType = "dropdown"
        break
    }

    return {
      text: qd.title,
      question_type: questionType,
      options: qd.options,
      description: qd.description,
      is_required: qd.required,
      code: qd.code,
      source: qd.source,
    }
  }

  const handleUpdateQuestion = async (updatedQuestion: QuestionData) => {
    const questionId = updatedQuestion.id
    const isTemp = questionId.startsWith('temp-')

    const updates = convertFromQuestionData(updatedQuestion)

    if (isTemp) {
      // Update local state immediately for temp questions
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ))

      // Only save to backend if text is not empty
      if (updates.text && updates.text.trim() !== '') {
        try {
          const created = await createProgramStudyQuestion(surveyId, programStudyId, {
            text: updates.text,
            question_type: updates.question_type || 'radio',
            options: updates.options,
            description: updates.description,
            order: questions.find(q => q.id === questionId)?.order || questions.length + 1,
            is_required: updates.is_required || false,
            code: updates.code,
            source: updates.source,
          })

          setQuestions(prev => prev.map(q => 
            q.id === questionId ? created : q
          ))

          setPendingQuestions(prev => {
            const newSet = new Set(prev)
            newSet.delete(questionId)
            return newSet
          })

          setActiveQuestionId(created.id)
        } catch (error) {
          console.error("Error creating question:", error)
          alert("Failed to create question")
        }
      }
    } else {
      setQuestions(prev => prev.map(q =>
        q.id.toString() === questionId ? { ...q, ...updates } : q
      ))

      try {
        await updateProgramStudyQuestion(surveyId, programStudyId, parseInt(questionId), {
          text: updates.text,
          question_type: updates.question_type,
          options: updates.options,
          description: updates.description,
          is_required: updates.is_required,
          code: updates.code,
          source: updates.source,
        })
      } catch (error) {
        console.error("Error updating question:", error)
        alert("Failed to update question")
        fetchQuestions()
      }
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    const isTemp = questionId.startsWith('temp-')

    if (isTemp) {
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      setPendingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    } else {
      if (confirm('Are you sure you want to delete this question?')) {
        try {
          await deleteProgramStudyQuestion(surveyId, programStudyId, parseInt(questionId))
          setQuestions(prev => prev.filter(q => q.id.toString() !== questionId))
        } catch (error) {
          console.error("Error deleting question:", error)
          alert("Failed to delete question")
        }
      }
    }
  }

  const handleDuplicateQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id.toString() === questionId)
    if (!question) return

    const isTemp = questionId.startsWith('temp-')
    if (isTemp) {
      alert("Please save the question before duplicating")
      return
    }

    try {
      const created = await createProgramStudyQuestion(surveyId, programStudyId, {
        text: `${question.text} (Copy)`,
        question_type: question.question_type,
        options: question.options,
        description: question.description,
        order: questions.length + 1,
        is_required: question.is_required,
        code: question.code,
        source: question.source,
      })

      setQuestions([...questions, created])
    } catch (error) {
      console.error("Error duplicating question:", error)
      alert("Failed to duplicate question")
    }
  }

  const handlePublish = () => {
    console.log("Publishing survey...")
    alert("Survey published!")
  }

  const questionIds = questions.map(q => q.id.toString())

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
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
          title={surveyTitle}
          activeTab="program-study"
          isPreviewMode={isPreviewMode}
          surveyId={surveyId.toString()}
          programStudyId={programStudyId.toString()}
          onTabChange={(tab) => console.log("Tab changed:", tab)}
          onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
          onPublish={handlePublish}
        />

        <div className="bg-gray-50 min-h-screen p-6">
          <div className="w-full mx-auto space-y-4 pr-24">
            <div onClick={() => setActiveQuestionId(null)}>
              <SectionHeaderCard
                sectionNumber={1}
                totalSections={1}
                title="Program Study Question"
                description={`Specific Question for ${programStudyName}`}
                sectionOrder={1}
                isActive={false}
              />
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                {questions.map((question) => {
                  const isActive = activeQuestionId === question.id
                  const isEditable = !isPreviewMode && isActive

                  return (
                    <div key={question.id}>
                      <QuestionCardGForm
                        question={convertToQuestionData(question)}
                        isEditMode={isEditable}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                        onDuplicate={handleDuplicateQuestion}
                        onFocus={() => setActiveQuestionId(question.id)}
                      />
                    </div>
                  )
                })}
              </SortableContext>

              <DragOverlay>
                {activeId && questions.find(q => q.id.toString() === activeId) && (
                  <QuestionCardGForm
                    question={convertToQuestionData(questions.find(q => q.id.toString() === activeId)!)}
                    isEditMode={!isPreviewMode}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {!isPreviewMode && (
          <QuestionFloatingToolbar
            onAddQuestion={handleAddQuestion}
            surveyId={surveyId}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
