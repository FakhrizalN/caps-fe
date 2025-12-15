"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, X } from "lucide-react"

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
  isOther?: boolean
  navigation?: string // e.g., "next" or "section-123"
}

export interface SectionInfo {
  id: number
  title: string
}

interface QuestionContentProps {
  type: QuestionType
  options?: QuestionOption[]
  minValue?: number
  maxValue?: number
  minLabel?: string
  maxLabel?: string
  isEditMode?: boolean
  questionId: string
  responseValidation?: boolean
  sections?: SectionInfo[]
  // Props untuk menampilkan jawaban yang sudah dipilih
  selectedOption?: string       // untuk multiple_choice
  selectedOptions?: string[]    // untuk checkbox
  selectedValue?: number        // untuk linear_scale
  textAnswer?: string          // untuk short_answer/paragraph
  onOptionUpdate?: (optionId: string, label: string) => void
  onOptionDelete?: (optionId: string) => void
  onOptionAdd?: () => void
  onAddOther?: () => void
  onScaleUpdate?: (updates: { minValue?: number; maxValue?: number; minLabel?: string; maxLabel?: string }) => void
  onNavigationChange?: (optionId: string, navigation: string) => void
}

export function QuestionContentGForm({
  type,
  options = [],
  minValue = 1,
  maxValue = 5,
  minLabel,
  maxLabel,
  isEditMode = false,
  questionId,
  responseValidation = false,
  sections = [],
  selectedOption,
  selectedOptions = [],
  selectedValue,
  textAnswer,
  onOptionUpdate,
  onOptionDelete,
  onOptionAdd,
  onAddOther,
  onScaleUpdate,
  onNavigationChange
}: QuestionContentProps) {

  const hasOtherOption = options.some(opt => opt.isOther)

  // Preview Mode 
  if (!isEditMode) {
    switch (type) {
      case "multiple_choice":
        return (
          <RadioGroup value={selectedOption} disabled className="space-y-3">
            {options.map((opt, idx) => (
              <div key={opt.id || `mc-${idx}`} className="flex items-center space-x-3">
                <RadioGroupItem 
                  value={opt.id} 
                  id={`${questionId}-${opt.id}`}
                  checked={selectedOption === opt.id}
                  disabled
                />
                <Label 
                  htmlFor={`${questionId}-${opt.id}`} 
                  className="text-sm font-normal cursor-default"
                >
                  {opt.isOther ? (
                    <div className="flex items-center gap-2">
                      <span>Other:</span>
                      <Input      
                        placeholder="Your answer" 
                        className="w-full border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-0"
                        dir="ltr" 
                        disabled
                      />
                    </div>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: opt.label }} />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div key={opt.id || `cb-${idx}`} className="flex items-center space-x-3">
                <Checkbox 
                  id={`${questionId}-${opt.id}`}
                  checked={selectedOptions.includes(opt.id)}
                  disabled
                />
                <Label 
                  htmlFor={`${questionId}-${opt.id}`} 
                  className="text-sm font-normal cursor-default"
                >
                  {opt.isOther ? (
                    <div className="flex items-center gap-2">
                      <span>Other:</span>
                      <Input 
                        placeholder="Your answer" 
                        className="w-full border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-0"
                        dir="ltr" 
                        disabled
                      />
                    </div>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: opt.label }} />
                  )}
                </Label>
              </div>
            ))}
          </div>
        )

      case "linear_scale":
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-4 max-w-2xl w-full">
                <RadioGroup value={selectedValue?.toString()} disabled className="flex justify-between w-full">
                  {Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i).map((val) => (
                    <div key={`scale-${val}`} className="flex flex-col items-center space-y-2">
                      <Label htmlFor={`${questionId}-${val}`} className="text-sm">{val}</Label>
                      <RadioGroupItem 
                        value={val.toString()} 
                        id={`${questionId}-${val}`}
                        checked={selectedValue === val}
                        disabled
                      />
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-between text-sm text-gray-600 w-full">
                  <span>{minLabel || minValue}</span>
                  <span>{maxLabel || maxValue}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case "dropdown":
        return (
          <Select value={selectedOption} disabled>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt, idx) => (
                <SelectItem key={opt.id || `dd-${idx}`} value={opt.id || `dd-${idx}`}>
                  {opt.isOther ? "Other..." : opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "short_answer":
        return (
          <Input 
            placeholder="Your answer" 
            className="w-full border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-0"
            dir="ltr"
            value={textAnswer || ""}
            disabled
            readOnly
          />
        )

      case "paragraph":
        return (
          <textarea 
            className="w-full min-h-[100px] p-0 pb-2 border-0 border-b border-gray-300 rounded-none resize-y focus:outline-none focus:border-blue-600 bg-transparent" 
            placeholder="Your answer"
            dir="ltr"
            value={textAnswer || ""}
            disabled
            readOnly
          />
        )
    }
  }

  // Edit Mode
  switch (type) {
    case "multiple_choice":
    case "checkbox":
    case "dropdown":
      return (
        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={opt.id || `option-${idx}`} className="flex items-center gap-3 group">
              {/* Icon di kiri */}
              {type === "checkbox" ? (
                <Checkbox disabled className="mt-2" />
              ) : type === "multiple_choice" ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 mt-2 flex-shrink-0" />
              ) : (
                <span className="text-sm text-gray-500 mt-2 w-4 text-center">{idx + 1}.</span>
              )}
              
              {opt.isOther ? (
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-gray-700">Other...</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onOptionDelete?.(opt.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Input
                      value={opt.label || ""}
                      onChange={(e) => onOptionUpdate?.(opt.id, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-0"
                    />
                    
                    {/* Response Validation Dropdown - Desktop only */}
                    {responseValidation && (
                      <Select 
                        value={opt.navigation || ""}
                        onValueChange={(value) => onNavigationChange?.(opt.id, value)}
                      >
                        <SelectTrigger className="w-[200px] h-8 hidden md:flex">
                          <SelectValue placeholder="Continue to next section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="next">Continue to next section</SelectItem>
                          {sections.map((section, sectionIdx) => (
                            <SelectItem key={section.id} value={`section-${section.id}`}>
                              Go to section {sectionIdx + 1} ({section.title})
                            </SelectItem>
                          ))}
                          <SelectItem value="submit">Submit form</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {options.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onOptionDelete?.(opt.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Response Validation Dropdown - Mobile only (below the option) */}
                  {responseValidation && (
                    <div className="md:hidden mt-2">
                      <Select 
                        value={opt.navigation || ""}
                        onValueChange={(value) => onNavigationChange?.(opt.id, value)}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder="Continue to next section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="next">Continue to next section</SelectItem>
                          {sections.map((section, sectionIdx) => (
                            <SelectItem key={section.id} value={`section-${section.id}`}>
                              Go to section {sectionIdx + 1} ({section.title})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Add Option Button */}
          <div className="flex items-center gap-3">
            {type === "checkbox" ? (
              <Checkbox disabled className="opacity-40" />
            ) : type === "multiple_choice" ? (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 opacity-40 flex-shrink-0" />
            ) : (
              <span className="text-sm text-gray-400 w-4 text-center">{options.length + 1}.</span>
            )}
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onOptionAdd}
                className="text-gray-600 px-2 h-auto py-1 hover:bg-transparent"
              >
                Add option
              </Button>
            </div>
          </div>
        </div>
      )

    case "linear_scale":
      return (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex gap-6 items-end">
              <div className="flex-1 max-w-[120px]">
                <Label className="text-sm text-gray-700 mb-2 block">Min</Label>
                <Select
                  value={minValue.toString()}
                  onValueChange={(v) => onScaleUpdate?.({ minValue: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <span className="text-gray-500 pb-2">to</span>
              
              <div className="flex-1 max-w-[120px]">
                <Label className="text-sm text-gray-700 mb-2 block">Max</Label>
                <Select
                  value={maxValue.toString()}
                  onValueChange={(v) => onScaleUpdate?.({ maxValue: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="flex gap-4 max-w-lg w-full">
              <div className="flex-1">
                <Label className="text-sm text-gray-700 mb-2 block">{minValue} label (optional)</Label>
                <Input
                  value={minLabel || ""}
                  onChange={(e) => onScaleUpdate?.({ minLabel: e.target.value })}
                  placeholder={`Label for ${minValue}`}
                  className="border-gray-300"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm text-gray-700 mb-2 block">{maxValue} label (optional)</Label>
                <Input
                  value={maxLabel || ""}
                  onChange={(e) => onScaleUpdate?.({ maxLabel: e.target.value })}
                  placeholder={`Label for ${maxValue}`}
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      )

    case "short_answer":
      return (
        <div className="border-b border-gray-300 pb-2 max-w-md">
          <span className="text-sm text-gray-400">Short answer text</span>
        </div>
      )

    case "paragraph":
      return (
        <div className="border-b border-gray-300 pb-2 max-w-2xl">
          <span className="text-sm text-gray-400">Long answer text</span>
        </div>
      )
  }
}
