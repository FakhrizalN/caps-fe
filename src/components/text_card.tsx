"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalTitle(title)
  }, [title])

  useEffect(() => {
    setLocalDescription(description)
  }, [description])

  const handleTitleChange = (value: string) => {
    setLocalTitle(value)
    onTitleChange?.(value)
  }

  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value)
    onDescriptionChange?.(value)
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
            {isEditingTitle ? (
              <Input
                ref={titleRef}
                value={localTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                className="text-lg font-medium text-gray-800 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 py-1"
                placeholder="Title"
                autoFocus
                dir="ltr"
              />
            ) : (
              <div>
                <h2 
                  className="text-lg font-medium text-gray-800 cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors min-h-[28px]"
                  onClick={() => setIsEditingTitle(true)}
                  dir="ltr"
                >
                  {localTitle || "Title"}
                </h2>
                <div className="w-full h-0 mt-2 border-t border-gray-300" />
              </div>
            )}

            {/* Description */}
            {isEditingDescription ? (
              <Textarea
                value={localDescription}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onBlur={() => setIsEditingDescription(false)}
                className="text-sm font-medium text-gray-900 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 py-1 min-h-[60px] resize-none"
                placeholder="Description"
                autoFocus
                dir="ltr"
              />
            ) : (
              localDescription ? (
                <div>
                  <p 
                    className="text-sm font-medium text-gray-900 cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors min-h-[24px]"
                    onClick={() => setIsEditingDescription(true)}
                    dir="ltr"
                  >
                    {localDescription}
                  </p>
                  <div className="w-full h-0 mt-2 border-t border-gray-300" />
                </div>
              ) : (
                <div 
                  className="text-sm font-medium text-gray-400 cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors min-h-[24px]"
                  onClick={() => setIsEditingDescription(true)}
                  dir="ltr"
                >
                  Description
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
