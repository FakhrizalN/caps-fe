"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, GripVertical, Copy, Bold, Italic, Underline, Link } from "lucide-react"
import { useState, useRef } from "react"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export type QuestionType = 
  | "multiple_choice" 
  | "checkbox" 
  | "linear_scale" 
  | "short_answer" 
  | "paragraph" 
  | "dropdown"

export interface QuestionOption {
  id: string
  label: string
}

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

interface QuestionCardProps {
  question: QuestionData
  isEditMode?: boolean
  onUpdate?: (question: QuestionData) => void
  onDelete?: (questionId: string) => void
  onDuplicate?: (questionId: string) => void
}

export function QuestionCard({
  question,
  isEditMode = false,
  onUpdate,
  onDelete,
  onDuplicate
}: QuestionCardProps) {
  const [localQuestion, setLocalQuestion] = useState<QuestionData>(question)
  const [isFocused, setIsFocused] = useState(false)
  const editableRef = useRef<HTMLDivElement>(null)

  const updateQuestion = (updates: Partial<QuestionData>) => {
    const updated = { ...localQuestion, ...updates }
    setLocalQuestion(updated)
    onUpdate?.(updated)
  }

  const handleTypeChange = (type: QuestionType) => {
    const updates: Partial<QuestionData> = { type }
    
    if (["multiple_choice", "checkbox", "dropdown"].includes(type) && !localQuestion.options) {
      updates.options = [{ id: "opt1", label: "Option 1" }]
    }
    
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

  const applyFormatting = (command: string) => {
    document.execCommand(command, false, undefined)
    editableRef.current?.focus()
  }

  const handleContentChange = () => {
    if (editableRef.current) {
      const content = editableRef.current.innerText || "Question"
      updateQuestion({ title: content })
    }
  }

  const renderContent = () => {
    const { type, options, minValue = 1, maxValue = 5, minLabel, maxLabel, id } = localQuestion

    if (!isEditMode) {
      switch (type) {
        case "multiple_choice":
          return (
            <RadioGroup className="space-y-2">
              {options?.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.id} id={`${id}-${opt.id}`} />
                  <Label htmlFor={`${id}-${opt.id}`}>{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )

        case "checkbox":
          return (
            <div className="space-y-2">
              {options?.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <Checkbox id={`${id}-${opt.id}`} />
                  <Label htmlFor={`${id}-${opt.id}`}>{opt.label}</Label>
                </div>
              ))}
            </div>
          )

        case "linear_scale":
          return (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{minLabel || minValue}</span>
                <span>{maxLabel || maxValue}</span>
              </div>
              <RadioGroup className="flex justify-between">
                {Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i).map((val) => (
                  <div key={val} className="flex flex-col items-center space-y-2">
                    <RadioGroupItem value={val.toString()} id={`${id}-${val}`} />
                    <Label htmlFor={`${id}-${val}`} className="text-sm">{val}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )

        case "dropdown":
          return (
            <Select>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                {options?.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )

        case "short_answer":
          return <Input placeholder="Your answer" className="max-w-md" />

        case "paragraph":
          return <textarea className="w-full min-h-[100px] p-2 border rounded-md" placeholder="Your answer" />
      }
    }

    switch (type) {
      case "multiple_choice":
      case "checkbox":
      case "dropdown":
        return (
          <div className="space-y-2">
            {options?.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                {type === "checkbox" ? (
                  <Checkbox disabled />
                ) : type === "multiple_choice" ? (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                ) : (
                  <span className="text-sm text-gray-500">{idx + 1}.</span>
                )}
                <Input
                  value={opt.label}
                  onChange={(e) => handleOptionUpdate(opt.id, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-blue-600"
                />
                {(options?.length || 0) > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => handleOptionDelete(opt.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-1">
              {type === "checkbox" ? (
                <Checkbox disabled className="opacity-50" />
              ) : type === "multiple_choice" ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 opacity-50" />
              ) : (
                <span className="text-sm text-gray-500">{(options?.length || 0) + 1}.</span>
              )}
              <Button variant="ghost" size="sm" onClick={handleOptionAdd} className="text-gray-600 hover:bg-transparent">
                Add option
              </Button>
              <span className="text-sm text-gray-500">or</span>
              <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto hover:no-underline">
                add "Other"
              </Button>
            </div>
          </div>
        )

      case "linear_scale":
        return (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Min</Label>
                <Select
                  value={minValue.toString()}
                  onValueChange={(v) => updateQuestion({ minValue: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Max</Label>
                <Select
                  value={maxValue.toString()}
                  onValueChange={(v) => updateQuestion({ maxValue: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Min Label</Label>
                <Input
                  value={minLabel || ""}
                  onChange={(e) => updateQuestion({ minLabel: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="flex-1">
                <Label>Max Label</Label>
                <Input
                  value={maxLabel || ""}
                  onChange={(e) => updateQuestion({ maxLabel: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        )

      case "short_answer":
        return <Input placeholder="Short answer text" disabled className="max-w-md bg-gray-50" />

      case "paragraph":
        return <textarea className="w-full min-h-[100px] p-2 border rounded-md bg-gray-50" placeholder="Long answer text" disabled />
    }
  }

  return (
    <Card 
      className={`transition-all ${
        isEditMode && isFocused 
          ? 'shadow-md border-l-4 border-l-blue-600' 
          : 'shadow-sm hover:shadow-md'
      }`}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false)
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          {isEditMode && (
            <Button variant="ghost" size="icon" className="cursor-move mt-2 hover:bg-transparent">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </Button>
          )}
          
          <div className="flex-1 space-y-1">
            {isEditMode ? (
              <>
                <div
                  ref={editableRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleContentChange}
                  onFocus={() => setIsFocused(true)}
                  className="font-medium text-base border-b border-gray-300 px-0 py-2 outline-none focus:border-blue-600 min-h-[32px]"
                  dangerouslySetInnerHTML={{ __html: localQuestion.title || "Question" }}
                />
                
                {/* Toolbar */}
                <div className="flex items-center gap-0 pt-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-gray-100 rounded"
                    onClick={() => applyFormatting("bold")}
                    type="button"
                  >
                    <Bold className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-gray-100 rounded"
                    onClick={() => applyFormatting("italic")}
                    type="button"
                  >
                    <Italic className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-gray-100 rounded"
                    onClick={() => applyFormatting("underline")}
                    type="button"
                  >
                    <Underline className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-gray-100 rounded"
                    onClick={() => {
                      const url = prompt("Enter URL:")
                      if (url) {
                        document.execCommand("createLink", false, url)
                        editableRef.current?.focus()
                      }
                    }}
                    type="button"
                  >
                    <Link className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-medium">
                  {localQuestion.title}
                  {localQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {localQuestion.description && (
                  <p className="text-sm text-gray-500">{localQuestion.description}</p>
                )}
              </>
            )}
          </div>

          {isEditMode && (
            <Select value={localQuestion.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="checkbox">Check Box</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="linear_scale">Linear Scale</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="paragraph">Paragraph</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {renderContent()}
      </CardContent>

      {isEditMode && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={() => onDuplicate?.(question.id)}>
              <Copy className="h-4 w-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={() => onDelete?.(question.id)}>
              <Trash2 className="h-4 w-4 text-gray-600" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <div className="flex items-center gap-2">
              <Label htmlFor={`req-${question.id}`} className="text-sm text-gray-600">Required</Label>
              <Switch
                id={`req-${question.id}`}
                checked={localQuestion.required}
                onCheckedChange={(required) => updateQuestion({ required })}
              />
            </div>
          </div>

          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <span className="text-xl text-gray-600">⋮</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
