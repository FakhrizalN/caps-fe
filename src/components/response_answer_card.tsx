"use client"

import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

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
}

interface ResponseAnswerCardProps {
  answer: ResponseAnswer
}

export function ResponseAnswerCard({ answer }: ResponseAnswerCardProps) {
  const renderAnswer = () => {
    switch (answer.type) {
      case "multiple_choice":
        return (
          <RadioGroup value={answer.selectedOption} disabled className="space-y-2">
            {answer.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} disabled />
                <Label htmlFor={option.id} className="font-normal cursor-default">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {answer.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={answer.selectedOptions?.includes(option.id)}
                  disabled
                  id={option.id}
                />
                <Label htmlFor={option.id} className="font-normal cursor-default">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case "linear_scale":
        return (
          <div className="space-y-4">
             <RadioGroup value={answer.selectedValue?.toString()} disabled>
            <div className="flex items-center justify-between gap-2">
              {Array.from(
                { length: (answer.maxValue ?? 5) - (answer.minValue ?? 1) + 1 },
                (_, i) => (answer.minValue ?? 1) + i
              ).map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium">{num}</span>
                  <RadioGroupItem
                    value={num.toString()}
                    checked={answer.selectedValue === num}
                    disabled
                    className="cursor-default"
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
      case "paragraph":
        return (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700">
              {answer.textAnswer || <span className="text-gray-400 italic">No answer provided</span>}
            </p>
          </div>
        )

      case "dropdown":
        return (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 w-full max-w-xs">
            <p className="text-sm text-gray-700">
              {answer.options?.find(opt => opt.id === answer.selectedOption)?.label || 
                <span className="text-gray-400 italic">No selection</span>}
            </p>
          </div>
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

          {/* Answer Content */}
          <div className="mt-4">
            {renderAnswer()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
