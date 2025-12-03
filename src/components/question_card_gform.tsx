"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { QuestionContentGForm, QuestionOption, QuestionType, SectionInfo } from "./question_content_gform"
import { QuestionFooterGForm } from "./question_footer_gform"
import { QuestionHeaderGForm, QuestionHeaderGFormRef } from "./question_header_gform"

export interface QuestionData {
  id: string
  type: QuestionType
  title: string
  description?: string
  options?: QuestionOption[]
  required: boolean
  minValue?: number
  maxValue?: number
  minLabel?: string
  maxLabel?: string
  code?: string
  source?: string

  selectedOption?: string       
  selectedOptions?: string[]    
  selectedValue?: number          
  textAnswer?: string            
  gridAnswers?: Record<string, string> 
}

interface QuestionCardGFormProps {
  question: QuestionData
  isEditMode?: boolean
  sections?: SectionInfo[]
  onUpdate?: (question: QuestionData) => void
  onDelete?: (questionId: string) => void
  onDuplicate?: (questionId: string) => void
  onFocus?: () => void
}

export function QuestionCardGForm({
  question,
  isEditMode = false,
  sections = [],
  onUpdate,
  onDelete,
  onDuplicate,
  onFocus
}: QuestionCardGFormProps) {
  const [localQuestion, setLocalQuestion] = useState<QuestionData>(question)
  const [isFocused, setIsFocused] = useState(false)
  const [showDescription, setShowDescription] = useState(!!question.description)
  const [responseValidation, setResponseValidation] = useState(false)
  const headerRef = useRef<QuestionHeaderGFormRef>(null)

  // Auto-enable response validation if branches exist
  useEffect(() => {
    const hasBranches = localQuestion.options?.some(opt => opt.navigation && opt.navigation !== 'next')
    if (hasBranches && localQuestion.type === 'multiple_choice') {
      setResponseValidation(true)
    }
  }, [localQuestion.options, localQuestion.type])

  // Drag and drop setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: question.id,
    disabled: !isEditMode
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // Prevent collapse during drag
    height: isDragging ? 'auto' : undefined,
    minHeight: isDragging ? 'fit-content' : undefined,
  }

  const handleCardClick = () => {
    if (!isEditMode) {
      // Trigger focus to activate edit mode
      onFocus?.()
      // Focus title only when activating edit mode
      setTimeout(() => {
        headerRef.current?.focusTitle()
      }, 50)
    }
    // If already in edit mode, don't focus title (allow clicking on other fields)
  }

  const updateQuestion = (updates: Partial<QuestionData>) => {
    const updated = { ...localQuestion, ...updates }
    setLocalQuestion(updated)
    onUpdate?.(updated)
  }

  const handleTypeChange = (type: QuestionType) => {
    const updates: Partial<QuestionData> = { type }
    
    // Initialize options for option-based question types
    if (["multiple_choice", "checkbox", "dropdown"].includes(type) && !localQuestion.options) {
      updates.options = [{ id: "1", label: "Option 1" }]
    }
    
    // Initialize values for linear scale
    if (type === "linear_scale") {
      updates.minValue = localQuestion.minValue || 1
      updates.maxValue = localQuestion.maxValue || 5
    }
    
    updateQuestion(updates)
  }

  const handleOptionAdd = () => {
    const nextId = (localQuestion.options?.length || 0) + 1
    const newOption = {
      id: `${nextId}`,
      label: `Option ${nextId}`
    }
    updateQuestion({ options: [...(localQuestion.options || []), newOption] })
  }

  const handleOptionUpdate = (optionId: string, label: string) => {
    updateQuestion({
      options: localQuestion.options?.map(opt => 
        opt.id === optionId ? { ...opt, label } : opt
      )
    })
  }

  const handleOptionDelete = (optionId: string) => {
    updateQuestion({
      options: localQuestion.options?.filter(opt => opt.id !== optionId)
    })
  }

  const handleScaleUpdate = (updates: { minValue?: number; maxValue?: number; minLabel?: string; maxLabel?: string }) => {
    updateQuestion(updates)
  }

  const handleAddOther = () => {
  const nextId = (localQuestion.options?.length || 0) + 1
  const otherOption = {
    id: `${nextId}`,
    label: "Other",
    isOther: true
  }
  updateQuestion({ options: [...(localQuestion.options || []), otherOption] })
}

  const handleNavigationChange = (optionId: string, navigation: string) => {
    const updatedOptions = localQuestion.options?.map(opt => 
      opt.id === optionId ? { ...opt, navigation } : opt
    )
    updateQuestion({ options: updatedOptions })
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`transition-all cursor-pointer border-0 ${
        isEditMode && isFocused 
          ? 'shadow-md border-l-4 border-l-primary' 
          : 'shadow-sm hover:shadow-md'
      }`}
      onClick={handleCardClick}
      onFocus={() => {
        setIsFocused(true)
        onFocus?.()
      }}
    >
      <CardHeader className="pt-0 -mt-4">
        <div className="flex items-start gap-3">
          {/*Edit Mode */}
          {isEditMode && (
            <Button 
              {...attributes}
              {...listeners}
              variant="ghost" 
              size="icon" 
              className="cursor-grab active:cursor-grabbing mt-2 hover:bg-gray-100 h-8 w-8 touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </Button>
          )}
          
          {/* Question Header Component */}
          <QuestionHeaderGForm
            ref={headerRef}
            title={localQuestion.title}
            description={localQuestion.description}
            type={localQuestion.type}
            required={localQuestion.required}
            isEditMode={isEditMode}
            showDescription={showDescription}
            onTitleChange={(title) => updateQuestion({ title })}
            onDescriptionChange={(description) => updateQuestion({ description })}
            onTypeChange={handleTypeChange}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
        {/* Question Content Component */}
        <QuestionContentGForm
          type={localQuestion.type}
          options={localQuestion.options}
          minValue={localQuestion.minValue}
          maxValue={localQuestion.maxValue}
          minLabel={localQuestion.minLabel}
          maxLabel={localQuestion.maxLabel}
          isEditMode={isEditMode}
          questionId={localQuestion.id}
          responseValidation={responseValidation}
          sections={sections}
          onOptionUpdate={handleOptionUpdate}
          onOptionDelete={handleOptionDelete}
          onOptionAdd={handleOptionAdd}
          onAddOther={handleAddOther}
          onScaleUpdate={handleScaleUpdate}
          onNavigationChange={handleNavigationChange}
        />
      </CardContent>

      {/* Footer - Only in Edit Mode */}
      {isEditMode && (
        <CardFooter className="pt-0 pb-4" onClick={(e) => e.stopPropagation()}>
          <QuestionFooterGForm
            required={localQuestion.required}
            questionId={localQuestion.id}
            questionType={localQuestion.type}
            showDescription={showDescription}
            responseValidation={responseValidation}
            onRequiredChange={(required) => updateQuestion({ required })}
            onDuplicate={() => onDuplicate?.(localQuestion.id)}
            onDelete={() => onDelete?.(localQuestion.id)}
            onDescriptionToggle={(show) => {
              setShowDescription(show)
              if (show) {
                setTimeout(() => {
                  headerRef.current?.focusDescription()
                }, 50)
              }
            }}
            onResponseValidationToggle={setResponseValidation}
          />
        </CardFooter>
      )}
    </Card>
  )
}
