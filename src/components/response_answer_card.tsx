"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export interface QuestionOption {
  id: string
  label: string
  isOther?: boolean
}

export interface ResponseAnswer {
  id: string
  type: "multiple_choice" | "checkbox" | "dropdown" | "short_answer" | "paragraph" | "linear_scale" | "date" | "time"
  title: string
  description?: string
  required: boolean
  
  options?: QuestionOption[]
  
  // Linear scale
  minValue?: number
  maxValue?: number
  minLabel?: string
  maxLabel?: string
  
  // Answer data
  selectedOption?: string       
  selectedOptions?: string[]   
  selectedValue?: number          
  textAnswer?: string  
  
  code?: string
  source?: string
}

interface ResponseAnswerCardProps {
  answer: ResponseAnswer
  isReadOnly?: boolean
  onUpdate?: (answer: ResponseAnswer) => void
}

export function ResponseAnswerCard({
  answer,
  isReadOnly = true,
  onUpdate 
}: ResponseAnswerCardProps) {

  const updateAnswer = (updates: Partial<ResponseAnswer>) => {
    if (!isReadOnly && onUpdate) {
      onUpdate({ ...answer, ...updates })
    }
  }

  const renderAnswer = () => {
    switch (answer.type) {
      case "multiple_choice":
        return (
          <RadioGroup 
            value={answer.selectedOption || ""} 
            disabled={isReadOnly}
            onValueChange={(value) => updateAnswer({ selectedOption: value })}
            className="space-y-2"
          >
            {answer.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={`${answer.id}-${option.id}`} disabled={isReadOnly} />
                <Label 
                  htmlFor={`${answer.id}-${option.id}`} 
                  className={`font-normal ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        const handleCheckboxChange = (optionId: string, checked: boolean) => {
          if (isReadOnly) return
          
          const currentSelected = answer.selectedOptions || []
          const newSelected = checked 
            ? [...currentSelected, optionId]
            : currentSelected.filter(id => id !== optionId)
          
          updateAnswer({ selectedOptions: newSelected })
        }
        return (
          <div className="space-y-2">
            {answer.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={answer.selectedOptions?.includes(option.id)}
                  disabled={isReadOnly}
                  onCheckedChange={(checked) => handleCheckboxChange(option.id, checked as boolean)}
                  id={`${answer.id}-${option.id}`}
                />
                <Label 
                  htmlFor={`${answer.id}-${option.id}`} 
                  className={`font-normal ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case "linear_scale":
        return (
          <div className="space-y-4">
             <RadioGroup 
              value={answer.selectedValue?.toString() || ""} 
              disabled={isReadOnly}
              onValueChange={(value) => updateAnswer({ selectedValue: Number(value) })}
            >
              <div className="flex items-center justify-between gap-2">
                {Array.from(
                { length: (answer.maxValue ?? 5) - (answer.minValue ?? 1) + 1 },
                (_, i) => (answer.minValue ?? 1) + i
              ).map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium">{num}</span>
                  <RadioGroupItem
                    value={num.toString()}
                    disabled={isReadOnly}
                  />
                </div>
              ))}
            </div>
            </RadioGroup>
            {(answer.minLabel || answer.maxLabel) && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{answer.minLabel}</span>
                <span>{answer.maxLabel}</span>
              </div>
            )}
          </div>
        )

      case "short_answer":
         if (isReadOnly) {
          return (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                {answer.textAnswer || <span className="text-gray-400 italic">No answer provided</span>}
              </p>
            </div>
          )
        }
          return (
            <Input
              type="text"
              placeholder="Your answer"
              value={answer.textAnswer || ""}
              onChange={(e) => updateAnswer({ textAnswer: e.target.value })}
              className="max-w-md"
            />
        )       
      case "paragraph":
        if (isReadOnly) {
          return (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {answer.textAnswer || <span className="text-gray-400 italic">No answer provided</span>}
              </p>
            </div>
          )
        }
        return (
          <Textarea
            placeholder="Your answer"
            value={answer.textAnswer || ""}
            onChange={(e) => updateAnswer({ textAnswer: e.target.value })}
            rows={4}
            className="w-full"
          />
        )

      case "dropdown":
        if (isReadOnly) {
          return (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200 w-full max-w-xs">
              <p className="text-sm text-gray-700">
                {answer.options?.find(opt => opt.id === answer.selectedOption)?.label || 
                  <span className="text-gray-400 italic">No selection</span>}
              </p>
            </div>
          )
        }
        return (
          <Select 
            value={answer.selectedOption || ""} 
            onValueChange={(value) => updateAnswer({ selectedOption: value })}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {answer.options?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

        default:
          return <p className="text-sm text-gray-500">Answer type not supported</p>
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Question Title */}
          <div>
            <h3 className="text-base font-medium text-gray-900">
              {answer.title}
              {answer.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {answer.description && (
              <p className="text-sm text-gray-600 mt-1">{answer.description}</p>
            )}
          </div>


          <div className="mt-4">
            {renderAnswer()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
