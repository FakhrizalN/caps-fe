"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { QuestionCardGForm, QuestionData } from "@/components/question_card_gform"
import { QuestionType, SectionInfo } from "@/components/question_content_gform"
import { QuestionFloatingToolbar } from "@/components/question_floating_toolbar"
import { QuestionToolbar } from "@/components/question_toolbar"
import { ReorderSectionsDialog } from "@/components/reorder-sections-dialog"
import { SectionHeaderCard } from "@/components/section_header_card"
import { TextCard } from "@/components/text_card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  createQuestion,
  createSection,
  deleteQuestion,
  deleteSection,
  getQuestions,
  getSections,
  getSurvey,
  Question,
  Section,
  updateQuestion,
  updateSection,
  updateSurvey,
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

interface TextElement {
  id: string
  title: string
  description: string
  sectionId: number
  order: number
}

interface SectionWithQuestions extends Section {
  questions: Question[]
  texts: TextElement[]
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
  const [activeQuestionId, setActiveQuestionId] = useState<number | string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null)
  const [activeElementType, setActiveElementType] = useState<'question' | 'header' | 'section' | 'text'>('question')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false)

  // Drag and drop sensors - only vertical dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end for reordering questions
  const handleDragEnd = async (event: DragEndEvent, sectionId: number) => {
    const { active, over } = event

    setActiveId(null)

    if (!over || active.id === over.id) return

    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const oldIndex = section.questions.findIndex(q => q.id.toString() === active.id)
    const newIndex = section.questions.findIndex(q => q.id.toString() === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Don't allow reordering temporary questions
    const draggedQuestion = section.questions[oldIndex]
    if (typeof draggedQuestion.id === 'string' && draggedQuestion.id.startsWith('temp-')) {
      console.log("Cannot reorder temporary question")
      return
    }

    // Calculate new order and update state immediately for smooth UX
    const newQuestions = arrayMove(section.questions, oldIndex, newIndex).map((q, index) => ({
      ...q,
      order: index + 1 // Update order field immediately
    }))
    
    // Update local state immediately
    setSections(prevSections => prevSections.map(s => 
      s.id === sectionId ? { ...s, questions: newQuestions } : s
    ))
    
    // Update order in backend - only for saved questions (with numeric IDs)
    try {
      // Filter out temporary questions and update only saved ones
      const updatePromises = newQuestions
        .filter(question => typeof question.id === 'number')
        .map((question) => {
          // Find the actual index in the full array (including temp questions)
          const actualIndex = newQuestions.indexOf(question)
          return updateQuestion(surveyId, sectionId, question.id as number, {
            text: question.text,
            question_type: question.question_type,
            options: question.options,
            description: question.description,
            is_required: question.is_required,
            order: actualIndex + 1
          })
        })
      
      // Wait for all updates - no need to update state again since it's already correct
      await Promise.all(updatePromises)
      console.log("Question order updated successfully")
    } catch (error) {
      console.error("Error updating question order:", error)
      // Revert on error
      setSections(prevSections => prevSections.map(s => 
        s.id === sectionId ? { ...s, questions: section.questions } : s
      ))
      alert("Failed to update question order")
    }
  }

  // Fetch survey data and sections
  useEffect(() => {
    let isMounted = true
    
    async function fetchData() {
      try {
        // Fetch survey details
        const survey = await getSurvey(surveyId.toString())
        if (!isMounted) return
        
        setSurveyTitle(survey.title)
        setSurveyDescription(survey.description || "")

        // Fetch sections
        let sectionsData = await getSections(surveyId)
        if (!isMounted) return
        
        // If no sections exist, create a default one
        if (sectionsData.length === 0) {
          const defaultSection = await createSection(surveyId, {
            title: "Section1",
            description: "",
            order: 1
          })
          if (!isMounted) return
          sectionsData = [defaultSection]
        }
        
        // Fetch questions for each section
        const sectionsWithQuestions = await Promise.all(
          sectionsData.map(async (section, index) => {
            const questions = await getQuestions(surveyId, section.id)
            
            // Separate text elements (questions with type "text") from regular questions
            const regularQuestions = questions.filter(q => q.question_type !== 'text')
            const textElements: TextElement[] = questions
              .filter(q => q.question_type === 'text')
              .map(q => ({
                id: q.id.toString(),
                title: q.text,
                description: q.description || "",
                sectionId: q.section_id,
                order: q.order
              }))
            
            // For the first section, ensure title and description match survey
            if (index === 0) {
              return { 
                ...section, 
                title: survey.title,
                description: survey.description || "",
                questions: regularQuestions, 
                texts: textElements 
              }
            }
            return { ...section, questions: regularQuestions, texts: textElements }
          })
        )
        if (!isMounted) return
        
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
          if (!isMounted) return
          
          setSections([{
            ...sectionsWithQuestions[0],
            questions: [defaultQuestion]
          }])
        }
      } catch (error) {
        console.error("Error fetching survey data:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [surveyId])

  const handleAddQuestion = () => {
    // Find the target section and insertion position
    let targetSection: SectionWithQuestions | undefined
    let insertIndex = -1

    // Check if we're at header - add to first section at the beginning
    if (activeElementType === 'header') {
      targetSection = sections[0]
      insertIndex = 0 // Add at the beginning of first section
    }
    // Check if we're at section header - add to that section at the beginning
    else if (activeElementType === 'section' && activeSectionId) {
      targetSection = sections.find(s => s.id === activeSectionId)
      insertIndex = 0 // Add at the beginning of the section
    }
    // First priority: use active section ID for questions
    else if (activeSectionId) {
      targetSection = sections.find(s => s.id === activeSectionId)
      
      if (targetSection) {
        // If there's an active question in this section, insert after it
        if (activeQuestionId) {
          const questionIndex = targetSection.questions.findIndex(q => q.id === activeQuestionId)
          if (questionIndex !== -1) {
            insertIndex = questionIndex + 1
          } else {
            insertIndex = targetSection.questions.length
          }
        } else {
          // No active question, add to end of section
          insertIndex = targetSection.questions.length
        }
      }
    }

    // Fallback: use the last section and append to end
    if (!targetSection) {
      targetSection = sections[sections.length - 1]
      insertIndex = targetSection ? targetSection.questions.length : 0
    }

    if (!targetSection) return

    // Create temporary question with temp ID
    const tempId = `temp-${Date.now()}`
    const tempQuestion: Question = {
      id: tempId as any, // Temporary ID
      text: "Untitled question",
      question_type: "radio",
      options: [{ id: "1", label: "Option 1" }],
      description: "",
      order: insertIndex + 1,
      is_required: false,
      section_id: targetSection.id
    }

    // Add to pending set
    setPendingQuestions(prev => new Set(prev).add(tempId))

    // Immediately show in UI at the correct position
    setSections(prevSections => prevSections.map(s => 
      s.id === targetSection!.id 
        ? { 
            ...s, 
            questions: [
              ...s.questions.slice(0, insertIndex),
              tempQuestion,
              ...s.questions.slice(insertIndex)
            ]
          }
        : s
    ))

    // Set the new question as active
    setActiveQuestionId(tempId)

    // Save to DB after delay
    setTimeout(async () => {
      try {
        const newQuestion = await createQuestion(surveyId, targetSection!.id, {
          text: "Untitled question",
          question_type: "radio",
          options: [{ id: "1", label: "Option 1" }],
          description: "",
          order: insertIndex + 1,
          is_required: false
        })

        // Replace temp question with real one
        setSections(prevSections => prevSections.map(s => 
          s.id === targetSection!.id 
            ? { 
                ...s, 
                questions: s.questions.map(q => 
                  q.id === tempId ? newQuestion : q
                )
              }
            : s
        ))

        // Update active question ID to the new real ID
        setActiveQuestionId(newQuestion.id)

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
          s.id === targetSection!.id 
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

  const handleAddText = async () => {
    // Find the target section and insertion position
    let targetSection: SectionWithQuestions | undefined
    let insertIndex = -1

    if (activeElementType === 'header') {
      targetSection = sections[0]
      insertIndex = 0
    } else if (activeElementType === 'section' && activeSectionId) {
      targetSection = sections.find(s => s.id === activeSectionId)
      insertIndex = 0
    } else if (activeSectionId) {
      targetSection = sections.find(s => s.id === activeSectionId)
      
      if (targetSection) {
        if (activeQuestionId) {
          // Find position in combined array of questions and texts
          const combinedItems = [...targetSection.questions, ...targetSection.texts].sort((a, b) => a.order - b.order)
          const itemIndex = combinedItems.findIndex(item => item.id === activeQuestionId)
          if (itemIndex !== -1) {
            insertIndex = itemIndex + 1
          } else {
            insertIndex = combinedItems.length
          }
        } else {
          insertIndex = targetSection.questions.length + targetSection.texts.length
        }
      }
    }

    if (!targetSection) {
      targetSection = sections[sections.length - 1]
      insertIndex = targetSection ? (targetSection.questions.length + targetSection.texts.length) : 0
    }

    if (!targetSection) return

    // Create temporary text element for immediate UI update
    const tempId = `text-${Date.now()}`
    const tempTextElement: TextElement = {
      id: tempId,
      title: "",
      description: "",
      sectionId: targetSection.id,
      order: insertIndex + 1
    }

    // Add to pending
    setPendingQuestions(prev => new Set(prev).add(tempId))

    // Add temporary element to section
    setSections(prevSections => prevSections.map(s => 
      s.id === targetSection!.id 
        ? { 
            ...s, 
            texts: [...s.texts, tempTextElement]
          }
        : s
    ))

    // Set as active
    setActiveQuestionId(tempId)
    setActiveSectionId(targetSection.id)
    setActiveElementType('text')

    // Save to database as question with type "text"
    try {
      const newQuestion = await createQuestion(surveyId, targetSection.id, {
        text: "Text",
        question_type: "text",
        options: [],
        description: "",
        order: insertIndex + 1,
        is_required: false
      })

      // Convert question to text element
      const textElement: TextElement = {
        id: newQuestion.id.toString(),
        title: newQuestion.text,
        description: newQuestion.description || "",
        sectionId: newQuestion.section_id,
        order: newQuestion.order
      }

      // Replace temp text with real one from database
      setSections(prevSections => prevSections.map(s => 
        s.id === targetSection!.id 
          ? { 
              ...s, 
              texts: s.texts.map(t => 
                t.id === tempId ? textElement : t
              )
            }
          : s
      ))

      // Update active ID
      setActiveQuestionId(textElement.id)

      // Remove from pending
      setPendingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    } catch (error) {
      console.error("Error creating text element:", error)
      alert("Failed to create text element")
      
      // Remove temp text on error
      setSections(prevSections => prevSections.map(s => 
        s.id === targetSection!.id 
          ? { ...s, texts: s.texts.filter(t => t.id !== tempId) }
          : s
      ))
      setPendingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    }
  }

  const handleUpdateText = async (textId: string | number, data: { title?: string; description?: string }) => {
    try {
      // Find the section that contains this text
      const section = sections.find(s => s.texts.some(t => t.id === textId))
      if (!section) return

      // Skip update for temporary texts (they haven't been saved yet)
      if (typeof textId === 'string' && textId.startsWith('text-')) {
        // Just update in local state
        setSections(sections.map(s => 
          s.id === section.id
            ? { ...s, texts: s.texts.map(t => t.id === textId ? { ...t, ...data } : t) }
            : s
        ))
        return
      }

      // Update in database as question with type "text"
      const textItem = section.texts.find(t => t.id === textId)
      if (!textItem) return

      const updatedQuestion = await updateQuestion(surveyId, section.id, parseInt(textId.toString()), {
        text: data.title !== undefined ? data.title : textItem.title,
        description: data.description !== undefined ? data.description : textItem.description,
        question_type: "text",
        options: [],
        is_required: false
      })

      // Convert back to text element
      const updatedText: TextElement = {
        id: updatedQuestion.id.toString(),
        title: updatedQuestion.text,
        description: updatedQuestion.description || "",
        sectionId: updatedQuestion.section_id,
        order: updatedQuestion.order
      }

      // Update in state
      setSections(sections.map(s => 
        s.id === section.id
          ? { ...s, texts: s.texts.map(t => t.id === textId ? updatedText : t) }
          : s
      ))
    } catch (error) {
      console.error("Error updating text:", error)
      alert("Failed to update text")
    }
  }

  const handleUpdateQuestion = async (question: Question) => {
    try {
      // Find the section that contains this question
      const section = sections.find(s => s.id === question.section_id)
      if (!section) return

      // Skip update for temporary questions (they haven't been saved yet)
      if (typeof question.id === 'string' && question.id.startsWith('temp-')) {
        // Just update in local state
        setSections(sections.map(s => 
          s.id === section.id
            ? { ...s, questions: s.questions.map(q => q.id === question.id ? question : q) }
            : s
        ))
        return
      }

      const updatedQuestion = await updateQuestion(surveyId, section.id, question.id as number, {
        text: question.text,
        question_type: question.question_type,
        options: question.options,
        description: question.description,
        is_required: question.is_required
      })

      setSections(sections.map(s => 
        s.id === section.id
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
      // Find the section that contains this question
      const section = sections.find(s => s.questions.some(q => q.id === questionId))
      if (!section) return

      // If it's a temporary question, just remove from UI
      if (typeof questionId === 'string' && questionId.startsWith('temp-')) {
        setSections(sections.map(s => 
          s.id === section.id
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

      await deleteQuestion(surveyId, section.id, questionId as number)
      setSections(sections.map(s => 
        s.id === section.id
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      ))
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Failed to delete question")
    }
  }

  const handleDeleteText = async (textId: string | number) => {
    try {
      // Find the section that contains this text
      const section = sections.find(s => s.texts.some(t => t.id === textId))
      if (!section) return

      // If it's a temporary text, just remove from UI
      if (typeof textId === 'string' && textId.startsWith('text-')) {
        setSections(sections.map(s => 
          s.id === section.id
            ? { ...s, texts: s.texts.filter(t => t.id !== textId) }
            : s
        ))
        setPendingQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(textId)
          return newSet
        })
        return
      }

      // Delete from database (it's stored as a question)
      await deleteQuestion(surveyId, section.id, parseInt(textId.toString()))
      setSections(sections.map(s => 
        s.id === section.id
          ? { ...s, texts: s.texts.filter(t => t.id !== textId) }
          : s
      ))
    } catch (error) {
      console.error("Error deleting text:", error)
      alert("Failed to delete text")
    }
  }

  const handleDuplicateQuestion = async (questionId: number | string) => {
    try {
      // Find the section that contains this question
      const section = sections.find(s => s.questions.some(q => q.id === questionId))
      const question = section?.questions.find(q => q.id === questionId)
      if (!question || !section) return

      // Can't duplicate temporary questions
      if (typeof questionId === 'string' && questionId.startsWith('temp-')) {
        alert("Please wait for the question to be saved before duplicating")
        return
      }

      const duplicate = await createQuestion(surveyId, section.id, {
        text: `${question.text} (Copy)`,
        question_type: question.question_type,
        options: question.options,
        description: question.description,
        order: question.order + 1,
        is_required: question.is_required
      })

      setSections(sections.map(s => 
        s.id === section.id
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

  const handleAddSection = async () => {
    try {
      // Create new section with incremental order
      const newSection = await createSection(surveyId, {
        title: `Section ${sections.length + 1}`,
        description: "",
        order: sections.length + 1
      })

      // Create a default question for the new section
      const defaultQuestion = await createQuestion(surveyId, newSection.id, {
        text: "Untitled question",
        question_type: "radio",
        options: [{ id: "1", label: "Option 1" }],
        description: "",
        order: 1,
        is_required: false
      })

      // Add the new section with the default question
      setSections([...sections, { ...newSection, questions: [defaultQuestion], texts: [] }])
      
      // Set the new section and question as active
      setActiveSectionId(newSection.id)
      setActiveQuestionId(defaultQuestion.id)
    } catch (error) {
      console.error("Error creating section:", error)
      alert("Failed to create section")
    }
  }

  const handleUpdateSection = async (sectionId: number, data: { title?: string; description?: string }) => {
    try {
      const updatedSection = await updateSection(surveyId, sectionId, data)
      setSections(sections.map(s => s.id === sectionId ? { ...s, ...updatedSection } : s))
    } catch (error) {
      console.error("Error updating section:", error)
      alert("Failed to update section")
    }
  }

  const handleDeleteSection = async (sectionId: number) => {
    try {
      // Don't allow deleting if it's the only section
      if (sections.length === 1) {
        alert("Cannot delete the last section")
        return
      }

      await deleteSection(surveyId, sectionId)
      setSections(sections.filter(s => s.id !== sectionId))
    } catch (error) {
      console.error("Error deleting section:", error)
      alert("Failed to delete section")
    }
  }

  const handleDuplicateSection = async (sectionId: number) => {
    try {
      const section = sections.find(s => s.id === sectionId)
      if (!section) return

      // Create duplicate section
      const duplicateSection = await createSection(surveyId, {
        title: `${section.title} (Copy)`,
        description: section.description || "",
        order: section.order + 1
      })

      // Duplicate all questions in the section
      const duplicatedQuestions = await Promise.all(
        section.questions.map(async (question) => {
          return await createQuestion(surveyId, duplicateSection.id, {
            text: question.text,
            question_type: question.question_type,
            options: question.options,
            description: question.description,
            order: question.order,
            is_required: question.is_required
          })
        })
      )

      // Duplicate all text elements in the section
      const duplicatedTexts = await Promise.all(
        section.texts.map(async (text) => {
          return await createQuestion(surveyId, duplicateSection.id, {
            text: text.title,
            question_type: "text",
            options: [],
            description: text.description,
            order: text.order,
            is_required: false
          })
        })
      )

      // Convert duplicated text questions to TextElement format
      const textElements: TextElement[] = duplicatedTexts.map(q => ({
        id: q.id.toString(),
        title: q.text,
        description: q.description || "",
        sectionId: q.section_id,
        order: q.order
      }))

      // Insert the duplicated section after the original
      setSections(prevSections => {
        const sectionIndex = prevSections.findIndex(s => s.id === sectionId)
        return [
          ...prevSections.slice(0, sectionIndex + 1),
          { ...duplicateSection, questions: duplicatedQuestions, texts: textElements },
          ...prevSections.slice(sectionIndex + 1)
        ]
      })
    } catch (error) {
      console.error("Error duplicating section:", error)
      alert("Failed to duplicate section")
    }
  }

  const handleMergeSection = async (sectionId: number) => {
    try {
      const sectionIndex = sections.findIndex(s => s.id === sectionId)
      if (sectionIndex <= 0) {
        alert("Cannot merge the first section")
        return
      }

      const currentSection = sections[sectionIndex]
      const previousSection = sections[sectionIndex - 1]

      if (!currentSection || !previousSection) return

      // Get the highest order in the previous section
      const allItemsInPrevious = [...previousSection.questions, ...previousSection.texts]
      const maxOrder = allItemsInPrevious.length > 0 
        ? Math.max(...allItemsInPrevious.map(item => item.order))
        : 0

      // Move all questions from current section to previous section
      // We need to create new questions in the previous section and delete from current
      const movedQuestions = await Promise.all(
        currentSection.questions.map(async (question, index) => {
          // Create new question in previous section
          const newQuestion = await createQuestion(surveyId, previousSection.id, {
            text: question.text,
            question_type: question.question_type,
            options: question.options,
            description: question.description,
            is_required: question.is_required,
            order: maxOrder + index + 1
          })
          
          // Delete old question from current section
          await deleteQuestion(surveyId, currentSection.id, question.id as number)
          
          return newQuestion
        })
      )

      // Move all text elements from current section to previous section
      const movedTexts = await Promise.all(
        currentSection.texts.map(async (text, index) => {
          // Create new text question in previous section
          const newText = await createQuestion(surveyId, previousSection.id, {
            text: text.title,
            question_type: "text",
            options: [],
            description: text.description,
            is_required: false,
            order: maxOrder + currentSection.questions.length + index + 1
          })
          
          // Delete old text from current section
          await deleteQuestion(surveyId, currentSection.id, parseInt(text.id))
          
          return newText
        })
      )

      // Convert moved text questions to TextElement format
      const textElements: TextElement[] = movedTexts.map(q => ({
        id: q.id.toString(),
        title: q.text,
        description: q.description || "",
        sectionId: q.section_id,
        order: q.order
      }))

      // Delete the current section
      await deleteSection(surveyId, sectionId)

      // Update state
      setSections(prevSections => {
        return prevSections
          .filter(s => s.id !== sectionId)
          .map(s => {
            if (s.id === previousSection.id) {
              return {
                ...s,
                questions: [...s.questions, ...movedQuestions],
                texts: [...s.texts, ...textElements]
              }
            }
            return s
          })
      })
    } catch (error) {
      console.error("Error merging section:", error)
      alert("Failed to merge section")
    }
  }

  const handleReorderSections = async (reorderedSections: { id: number; title: string; order: number }[]) => {
    try {
      // Get the section that will be first after reordering
      const newFirstSection = reorderedSections.find(s => s.order === 1)
      const oldFirstSection = sections.find(s => s.order === 1)
      
      if (!newFirstSection || !oldFirstSection) return

      // Check if first section changed
      const firstSectionChanged = newFirstSection.id !== oldFirstSection.id

      // Update state immediately for smooth UX
      let updatedSections = sections.map(section => {
        const reordered = reorderedSections.find(s => s.id === section.id)
        return reordered ? { ...section, order: reordered.order } : section
      }).sort((a, b) => a.order - b.order)
      
      setSections(updatedSections)

      // Prepare backend updates
      const updatePromises: Promise<any>[] = []

      if (firstSectionChanged) {
        // Get the section that's becoming first
        const newFirstSectionOriginal = sections.find(s => s.id === newFirstSection.id)
        
        if (!newFirstSectionOriginal) return

        // Update survey title to match new first section's title
        const newSurveyTitle = newFirstSectionOriginal.title

        console.log("First section changed, updating survey title", {
          oldFirstSectionId: oldFirstSection.id,
          newFirstSectionId: newFirstSection.id,
          newSurveyTitle
        })

        // Update survey title in state and backend
        setSurveyTitle(newSurveyTitle)
        updatePromises.push(
          updateSurvey(surveyId.toString(), { title: newSurveyTitle })
        )
      }

      // Update ALL sections with their new order ONLY (no title changes)
      console.log("Updating section orders")
      reorderedSections.forEach(section => {
        const updateData = { order: section.order }
        console.log(`Updating section ${section.id}:`, updateData)
        updatePromises.push(
          updateSection(surveyId, section.id, updateData).then(response => {
            console.log(`Response for section ${section.id}:`, response)
            return response
          })
        )
      })
      
      await Promise.all(updatePromises)
      console.log("Sections reordered successfully")
      
      // Give a small delay to ensure state is updated before dialog might reopen
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error("Error reordering sections:", error)
      alert("Failed to reorder sections")
      // Revert on error - refetch sections and survey
      const survey = await getSurvey(surveyId.toString())
      setSurveyTitle(survey.title)
      setSurveyDescription(survey.description || "")
      
      const sectionsData = await getSections(surveyId)
      const sectionsWithQuestions = await Promise.all(
        sectionsData.map(async (section) => {
          const questions = await getQuestions(surveyId, section.id)
          return { ...section, questions, texts: [] }
        })
      )
      setSections(sectionsWithQuestions)
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
      type: backendToFrontendType(question.question_type) as QuestionType,
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

  // Get all questions from all sections
  const allQuestions = sections.flatMap(s => s.questions)
  const totalQuestions = allQuestions.length
  const requiredQuestions = allQuestions.filter(q => q.is_required).length

  // Prepare sections info for response validation dropdown
  const sectionsInfo: SectionInfo[] = sections.map((section, index) => ({
    id: section.id,
    title: section.title || `Section${index + 1}`
  }))

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
            onAddText={handleAddText}
            onImportQuestion={() => console.log("Import question")}
            onAddSection={handleAddSection}
            activeQuestionId={activeQuestionId}
            activeElementType={activeElementType}
          />
        )}
        
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="ml-0 w-full space-y-3 pr-24">
            {/* Question Header Card */}
            <div onClick={() => {
              setActiveElementType('header')
              setActiveQuestionId(null)
              setActiveSectionId(null)
            }}>
              <SectionHeaderCard
                sectionNumber={1}
                totalSections={sections.length}
                title={surveyTitle}
                description={surveyDescription}
                sectionId={sections[0]?.id}
                sectionOrder={sections[0]?.order}
                isActive={activeElementType === 'header'}
                onTitleChange={async (newTitle) => {
                  setSurveyTitle(newTitle)
                  try {
                    await updateSurvey(surveyId.toString(), { title: newTitle })
                    // Also update the first section's title to keep them in sync
                    if (sections[0]) {
                      await updateSection(surveyId, sections[0].id, { title: newTitle })
                      setSections(sections.map((s, idx) => 
                        idx === 0 ? { ...s, title: newTitle } : s
                      ))
                    }
                  } catch (error) {
                    console.error("Error updating survey title:", error)
                  }
                }}
                onDescriptionChange={async (newDesc) => {
                  setSurveyDescription(newDesc)
                  try {
                    await updateSurvey(surveyId.toString(), { description: newDesc })
                    // Also update the first section's description to keep them in sync
                    if (sections[0]) {
                      await updateSection(surveyId, sections[0].id, { description: newDesc })
                      setSections(sections.map((s, idx) => 
                        idx === 0 ? { ...s, description: newDesc } : s
                      ))
                    }
                  } catch (error) {
                    console.error("Error updating survey description:", error)
                  }
                }}
                onMove={() => setIsReorderDialogOpen(true)}
                onDuplicate={sections[0] ? () => handleDuplicateSection(sections[0].id) : undefined}
              />
            </div>

            {/* Sections and Questions List */}
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => {
                // Show section header only for section 2 and beyond (section index >= 1)
                const showSectionHeader = sectionIndex >= 1
                
                // Get question IDs for sortable context
                const questionIds = section.questions.map(q => q.id.toString())
                
                // Combine questions and texts, then sort by order
                const combinedItems = [
                  ...section.questions.map(q => ({ type: 'question' as const, item: q, order: q.order })),
                  ...section.texts.map(t => ({ type: 'text' as const, item: t, order: t.order }))
                ].sort((a, b) => a.order - b.order)
                
                const contentItems = (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={(event) => handleDragEnd(event, section.id)}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={questionIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div 
                        className="space-y-3"
                        onClick={() => setActiveSectionId(section.id)}
                      >
                        {combinedItems.map((combined, itemIndex) => {
                          if (combined.type === 'question') {
                            const question = combined.item
                            const isPending = typeof question.id === 'string' && pendingQuestions.has(question.id)
                            const globalIndex = sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.questions.length, 0) + itemIndex
                            const isQuestionActive = activeQuestionId === question.id
                            const isQuestionEditable = !isPreviewMode && isQuestionActive
                            
                            return (
                              <div 
                                key={question.id} 
                                className="relative"
                                data-question-id={question.id}
                              >
                            <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
                              <QuestionCardGForm
                                question={questionToQuestionData(question)}
                                isEditMode={isQuestionEditable}
                                sections={sectionsInfo}
                                onUpdate={(updatedQuestionData) => {
                                  const updatedQuestion = questionDataToQuestion(updatedQuestionData, section.id)
                                  handleUpdateQuestion(updatedQuestion)
                                }}
                                onDelete={() => handleDeleteQuestion(question.id)}
                                onDuplicate={() => handleDuplicateQuestion(question.id)}
                                onFocus={() => {
                                  setActiveQuestionId(question.id)
                                  setActiveSectionId(section.id)
                                  setActiveElementType('question')
                                }}
                              />
                            </div>
                          </div>
                        )
                      } else {
                        // Text element
                        const textItem = combined.item
                        const isTextActive = activeQuestionId === textItem.id && activeElementType === 'text'
                        
                        return (
                          <div 
                            key={textItem.id}
                            data-text-id={textItem.id}
                          >
                            <TextCard
                              title={textItem.title}
                              description={textItem.description}
                              isActive={isTextActive}
                              onTitleChange={(title) => handleUpdateText(textItem.id, { title })}
                              onDescriptionChange={(description) => handleUpdateText(textItem.id, { description })}
                              onFocus={() => {
                                setActiveQuestionId(textItem.id)
                                setActiveSectionId(section.id)
                                setActiveElementType('text')
                              }}
                            />
                          </div>
                        )
                      }
                    })}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && section.questions.find(q => q.id.toString() === activeId) ? (
                        <div style={{ width: '100%', maxWidth: '800px' }}>
                          <QuestionCardGForm
                            question={questionToQuestionData(
                              section.questions.find(q => q.id.toString() === activeId)!
                            )}
                            isEditMode={true}
                            sections={sectionsInfo}
                            onUpdate={() => {}}
                            onDelete={() => {}}
                            onDuplicate={() => {}}
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )
                
                return (
                  <div key={section.id} className="space-y-3">
                    {/* Show section header BEFORE questions for section 2+ */}
                    {showSectionHeader && (
                      <div onClick={() => {
                        setActiveElementType('section')
                        setActiveQuestionId(section.id)
                        setActiveSectionId(section.id)
                      }}>
                        <SectionHeaderCard
                          sectionNumber={sectionIndex + 1}
                          totalSections={sections.length}
                          title={section.title}
                          description={section.description || ""}
                          sectionId={section.id}
                          sectionOrder={section.order}
                          isActive={activeElementType === 'section' && activeQuestionId === section.id}
                          onTitleChange={(title) => handleUpdateSection(section.id, { title })}
                          onDescriptionChange={(description) => handleUpdateSection(section.id, { description })}
                          onDelete={() => handleDeleteSection(section.id)}
                          onDuplicate={() => handleDuplicateSection(section.id)}
                          onMove={() => setIsReorderDialogOpen(true)}
                          onMerge={() => handleMergeSection(section.id)}
                        />
                      </div>
                    )}
                    {contentItems}
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

        {/* Reorder Sections Dialog */}
        <ReorderSectionsDialog
          open={isReorderDialogOpen}
          onOpenChange={setIsReorderDialogOpen}
          sections={sections.map((s, index) => ({
            id: s.id,
            title: index === 0 ? surveyTitle : (s.title || `Section ${index + 1}`),
            order: s.order
          }))}
          onReorder={handleReorderSections}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
