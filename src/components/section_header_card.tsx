"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bold, Copy, EllipsisVertical, Italic, Link as LinkIcon, List, ListOrdered, Merge, Move, Trash, Underline } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface SectionHeaderCardProps {
  sectionNumber: number
  totalSections: number
  title: string
  description: string
  sectionId?: number
  sectionOrder?: number
  isActive?: boolean
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onDelete?: () => void
  onDuplicate?: () => void
  onMove?: () => void
  onMerge?: () => void
}

export function SectionHeaderCard({
  sectionNumber,
  totalSections,
  title,
  description,
  sectionId,
  sectionOrder = 1,
  isActive = false,
  onTitleChange,
  onDescriptionChange,
  onDelete,
  onDuplicate,
  onMove,
  onMerge
}: SectionHeaderCardProps) {
  const [localTitle, setLocalTitle] = useState(title)
  const [localDescription, setLocalDescription] = useState(description)
  const [focusedElement, setFocusedElement] = useState<'title' | 'description' | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  
  // Check if this is the first section (survey header)
  const isFirstSection = sectionNumber === 1
  
  // Initialize contentEditable with HTML content
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerHTML = title || ""
      setLocalTitle(title)
      setIsInitialized(true)
    }
  }, [title])
  
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.innerHTML = description || ""
      setLocalDescription(description)
    }
  }, [description])

  const applyFormatting = (command: string) => {
    const element = focusedElement === 'description' ? descriptionRef.current : titleRef.current
    if (!element) return
    
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
      const content = titleRef.current.innerHTML
      setLocalTitle(content)
    }
  }

  const handleTitleBlur = () => {
    setFocusedElement(null)
    if (localTitle !== title) {
      onTitleChange?.(localTitle)
    }
  }

  const handleDescriptionInput = () => {
    if (descriptionRef.current) {
      const content = descriptionRef.current.innerHTML
      setLocalDescription(content)
    }
  }

  const handleDescriptionBlur = () => {
    setFocusedElement(null)
    if (localDescription !== description) {
      onDescriptionChange?.(localDescription)
    }
  }

  return (
    <div data-section-id={sectionId}>
      {/* Section Label Badge - positioned at top - hidden when only 1 section */}
      {totalSections > 1 && (
        <div className="w-fit h-12 bg-primary rounded-t-lg">
          <div className="px-[21px] py-[11px] text-white text-sm leading-5">
            Section {sectionNumber} of {totalSections}
          </div>
        </div>
      )}

      {/* Main Card with blue top border */}
      <div className={`${totalSections > 1 ? 'mt-[-8px]' : ''} bg-white rounded-lg ${isFirstSection ? 'border-t-[8px]' : 'border-t-[6px]'} border-primary ${isFirstSection ? 'p-6 pb-4' : 'p-6 pb-8'} shadow-md transition-all ${
        isActive ? 'border-l-4 border-l-primary' : ''
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className={`flex-1 ${isFirstSection ? 'space-y-2' : 'space-y-2'}`}>
            {/* Section Title */}
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleTitleInput}
              onFocus={() => setFocusedElement('title')}
              onBlur={handleTitleBlur}
              className={`${isFirstSection ? 'text-3xl font-normal' : 'text-lg font-medium text-gray-800'} border-b border-transparent px-0 py-1 outline-none focus:border-gray-300 min-h-[28px] empty:before:content-['Section_title'] empty:before:text-gray-400`}
              dir="ltr"
            />

            {/* Section Description */}
            <div
              ref={descriptionRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleDescriptionInput}
              onFocus={() => setFocusedElement('description')}
              onBlur={handleDescriptionBlur}
              className={`${isFirstSection ? 'text-sm text-gray-600' : 'text-sm font-medium text-gray-900'} border-b border-transparent px-0 py-1 outline-none focus:border-gray-300 min-h-[24px] empty:before:content-['${isFirstSection ? 'Form_description' : 'Description'}'] empty:before:text-gray-400`}
              dir="ltr"
            />

            {/* Formatting Toolbar - Only show when focused */}
            {focusedElement && (
            <div className="flex items-center gap-0 -mt-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatting("bold")}
                type="button"
                title="Bold"
              >
                <Bold className="h-4 w-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatting("italic")}
                type="button"
                title="Italic"
              >
                <Italic className="h-4 w-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatting("underline")}
                type="button"
                title="Underline"
              >
                <Underline className="h-4 w-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatting("link")}
                type="button"
                title="Insert link"
              >
                <LinkIcon className="h-4 w-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatting("insertUnorderedList")}
                type="button"
                title="Bulleted list"
              >
                <List className="h-4 w-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatting("insertOrderedList")}
                type="button"
                title="Numbered list"
              >
                <ListOrdered className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
            )}
          </div>

          {/* Action Buttons - positioned at top right */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                >
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Section
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onMove}>
                  <Move className="mr-2 h-4 w-4" />
                  Move Section
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Section
                  </DropdownMenuItem>
                )}
                {sectionOrder !== 1 && onMerge && (
                  <DropdownMenuItem onClick={onMerge}>
                    <Merge className="mr-2 h-4 w-4" />
                    Merge with above
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
