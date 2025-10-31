"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical } from "lucide-react"
import { useState } from "react"
import { QuestionHeaderGForm } from "./question_header_gform"
import { QuestionContentGForm, QuestionType, QuestionOption } from "./question_content_gform"
import { QuestionFooterGForm } from "./question_footer_gform"

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
}

interface QuestionCardGFormProps {
  question: QuestionData
  isEditMode?: boolean
  onUpdate?: (question: QuestionData) => void
  onDelete?: (questionId: string) => void
  onDuplicate?: (questionId: string) => void
}

export function QuestionCardGForm({
  question,
  isEditMode = false,
  onUpdate,
  onDelete,
  onDuplicate
}: QuestionCardGFormProps) {
  const [localQuestion, setLocalQuestion] = useState<QuestionData>(question)
  const [isFocused, setIsFocused] = useState(false)

  const updateQuestion = (updates: Partial<QuestionData>) => {
    const updated = { ...localQuestion, ...updates }
    setLocalQuestion(updated)
    onUpdate?.(updated)
  }

  const handleTypeChange = (type: QuestionType) => {
    const updates: Partial<QuestionData> = { type }
    
    // Initialize options for option-based question types
    if (["multiple_choice", "checkbox", "dropdown"].includes(type) && !localQuestion.options) {
      updates.options = [{ id: "opt1", label: "Option 1" }]
    }
    
    // Initialize values for linear scale
    if (type === "linear_scale") {
      updates.minValue = localQuestion.minValue || 1
      updates.maxValue = localQuestion.maxValue || 5
    }
    
    updateQuestion(updates)
  }

  const handleOptionAdd = () => {
    const newOption = {
      id: `opt${Date.now()}`,
      label: `Option ${(localQuestion.options?.length || 0) + 1}`
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
  const otherOption = {
    id: `opt${Date.now()}`,
    label: "Other",
    isOther: true
  }
  updateQuestion({ options: [...(localQuestion.options || []), otherOption] })
}

  return (
    <Card 
      className={`transition-all ${
        isEditMode && isFocused 
          ? 'shadow-md border-l-4 border-l-primary' 
          : 'shadow-sm hover:shadow-md'
      }`}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false)
        }
      }}
    >
      <CardHeader className="pt-0 -mt-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle - Only in Edit Mode */}
          {isEditMode && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="cursor-move mt-2 hover:bg-transparent h-8 w-8"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </Button>
          )}
          
          {/* Question Header Component */}
          <QuestionHeaderGForm
            title={localQuestion.title}
            description={localQuestion.description}
            type={localQuestion.type}
            required={localQuestion.required}
            isEditMode={isEditMode}
            onTitleChange={(title) => updateQuestion({ title })}
            onDescriptionChange={(description) => updateQuestion({ description })}
            onTypeChange={handleTypeChange}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
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
          onOptionUpdate={handleOptionUpdate}
          onOptionDelete={handleOptionDelete}
          onOptionAdd={handleOptionAdd}
          onAddOther={handleAddOther}
          onScaleUpdate={handleScaleUpdate}
        />
      </CardContent>

      {/* Footer - Only in Edit Mode */}
      {isEditMode && (
        <CardFooter className="pt-0 pb-4">
          <QuestionFooterGForm
            required={localQuestion.required}
            questionId={localQuestion.id}
            onRequiredChange={(required) => updateQuestion({ required })}
            onDuplicate={() => onDuplicate?.(localQuestion.id)}
            onDelete={() => onDelete?.(localQuestion.id)}
          />
        </CardFooter>
      )}
    </Card>
  )
}
