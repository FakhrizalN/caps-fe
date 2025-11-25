"use client"

import { Button } from "@/components/ui/button"
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Underline } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface TextCardProps {
  title?: string
  description?: string
  isActive?: boolean
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onFocus?: () => void
}

export function TextCard({
  title = "",
  description = "",
  isActive = false,
  onTitleChange,
  onDescriptionChange,
  onFocus
}: TextCardProps) {
  const [localTitle, setLocalTitle] = useState(title)
  const [localDescription, setLocalDescription] = useState(description)
  const [focusedElement, setFocusedElement] = useState<'title' | 'description' | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)

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
    if (titleRef.current) {
      const content = titleRef.current.innerHTML
      onTitleChange?.(content)
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
    if (descriptionRef.current) {
      const content = descriptionRef.current.innerHTML
      onDescriptionChange?.(content)
    }
  }

  return (
    <div data-text-card="true" onClick={onFocus}>
      {/* Main Card with blue top border - matching section header style */}
      <div className={`bg-white rounded-lg border-primary p-6 pb-8 shadow-md transition-all ${
        isActive ? 'border-l-4 border-l-primary' : ''
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            {/* Title */}
            <div>
              <div
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleTitleInput}
                onFocus={() => setFocusedElement('title')}
                onBlur={handleTitleBlur}
                className="text-lg font-medium text-gray-800 border-b border-transparent px-0 py-1 outline-none focus:border-gray-300 min-h-[28px] empty:before:content-['Title'] empty:before:text-gray-400"
                dir="ltr"
              />
            </div>

            {/* Description */}
            <div>
              <div
                ref={descriptionRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleDescriptionInput}
                onFocus={() => setFocusedElement('description')}
                onBlur={handleDescriptionBlur}
                className="text-sm font-medium text-gray-900 border-b border-transparent px-0 py-1 outline-none focus:border-gray-300 min-h-[24px] empty:before:content-['Description'] empty:before:text-gray-400"
                dir="ltr"
              />
            </div>

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
        </div>
      </div>
    </div>
  )
}
