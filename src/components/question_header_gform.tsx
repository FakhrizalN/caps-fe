"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered } from "lucide-react"
import { useRef, useEffect } from "react"
import { QuestionType } from "./question_content_gform"

interface QuestionHeaderProps {
  title: string
  description?: string
  type: QuestionType
  required?: boolean
  isEditMode?: boolean
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onTypeChange?: (type: QuestionType) => void
}

export function QuestionHeaderGForm({
  title,
  description,
  type,
  required = false,
  isEditMode = false,
  onTitleChange,
  onDescriptionChange,
  onTypeChange
}: QuestionHeaderProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)

  // Set initial content and ensure it's editable
  useEffect(() => {
    if (titleRef.current && isEditMode) {
      titleRef.current.textContent = title || ""
    }
  }, [isEditMode])

  const applyFormatting = (command: string, element: HTMLDivElement | null) => {
    if (!element)return; 
    
    if (command === "link") {
      const url = prompt("Enter URL:")
      if (url) {
        document.execCommand("createLink", false, url)
        element.focus()
      }
    } else {
      document.execCommand(command, false, undefined)
      element.focus()
    }
  }

  const handleTitleInput = () => {
    if (titleRef.current) {
      const content = titleRef.current.textContent || ""
      onTitleChange?.(content)
    }
  }

  const handleDescriptionInput = () => {
    if (descriptionRef.current) {
      const content = descriptionRef.current.textContent || ""
      onDescriptionChange?.(content)
    }
  }

  const handleTitleFocus = () => {
    if (titleRef.current && titleRef.current.textContent === "Untitled question") {
      // Select all text on focus
      const range = document.createRange()
      range.selectNodeContents(titleRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  // Preview Mode
  if (!isEditMode) {
    return (
      <div className="space-y-2" dir="ltr">
        <h3 className="text-base font-normal text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    )
  }

  // Edit Mode
  return (
    <div className="flex-1" dir="ltr">
      {/* Question Title */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleTitleInput}
            onFocus={handleTitleFocus}
            className="text-base text-gray-900 border-b border-gray-300 px-0 py-2 outline-none focus:border-primary min-h-[32px]"
            dir="ltr"
          >
           
          </div>
        </div>

        {/* Question Type Selector */}
        <Select value={type} onValueChange={(value) => onTypeChange?.(value as QuestionType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple choice</SelectItem>
            <SelectItem value="checkbox">Checkboxes</SelectItem>
            <SelectItem value="dropdown">Dropdown</SelectItem>
            <SelectItem value="short_answer">Short answer</SelectItem>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="linear_scale">Linear scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description Field */}
      <div
        ref={descriptionRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleDescriptionInput}
        className="text-sm text-gray-600 border-b border-transparent px-0 py-1 outline-none focus:border-gray-300 min-h-[24px] empty:before:content-['Description'] empty:before:text-gray-400"
        dir="ltr"
      />

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-0 -mt-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-gray-100 rounded"
          onClick={() => applyFormatting("bold", titleRef.current)}
          type="button"
          title="Bold"
        >
          <Bold className="h-4 w-4 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-gray-100 rounded"
          onClick={() => applyFormatting("italic", titleRef.current)}
          type="button"
          title="Italic"
        >
          <Italic className="h-4 w-4 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-gray-100 rounded"
          onClick={() => applyFormatting("underline", titleRef.current)}
          type="button"
          title="Underline"
        >
          <Underline className="h-4 w-4 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-gray-100 rounded"
          onClick={() => applyFormatting("link", titleRef.current)}
          type="button"
          title="Insert link"
        >
          <LinkIcon className="h-4 w-4 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-gray-100 rounded"
          onClick={() => applyFormatting("insertUnorderedList", titleRef.current)}
          type="button"
          title="Bulleted list"
        >
          <List className="h-4 w-4 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-gray-100 rounded"
          onClick={() => applyFormatting("insertOrderedList", titleRef.current)}
          type="button"
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    </div>
  )
}
