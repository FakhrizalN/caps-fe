"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, EllipsisVertical, Merge, Move, Trash } from "lucide-react"
import { useEffect, useState } from "react"

interface SectionHeaderCardProps {
  sectionNumber: number
  totalSections: number
  title: string
  description: string
  sectionId?: number
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
  isActive = false,
  onTitleChange,
  onDescriptionChange,
  onDelete,
  onDuplicate,
  onMove,
  onMerge
}: SectionHeaderCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [localTitle, setLocalTitle] = useState(title)
  const [localDescription, setLocalDescription] = useState(description)
  
  // Check if this is the first section (survey header)
  const isFirstSection = sectionNumber === 1
  
  // Sync local state with props when they change
  useEffect(() => {
    setLocalTitle(title)
  }, [title])
  
  useEffect(() => {
    setLocalDescription(description)
  }, [description])

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
          <div className={`flex-1 ${isFirstSection ? 'space-y-2' : 'space-y-4'}`}>
            {/* Section Title */}
            {isEditingTitle ? (
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false)
                  if (localTitle !== title) {
                    onTitleChange?.(localTitle)
                  }
                }}
                className={`${isFirstSection ? 'text-3xl font-normal' : 'text-lg font-medium text-gray-800'} border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 py-1`}
                autoFocus
                dir="ltr"
              />
            ) : (
              isFirstSection ? (
                <h1 
                  className="text-3xl font-normal cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                  dir="ltr"
                >
                  {localTitle}
                </h1>
              ) : (
                <div>
                  <h2 
                    className="text-lg font-medium text-gray-800 cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                    dir="ltr"
                  >
                    {localTitle}
                  </h2>
                  <div className="w-full h-0 mt-2 border-t border-gray-300" />
                </div>
              )
            )}

            {/* Section Description */}
            {isEditingDescription ? (
              isFirstSection ? (
                <Input
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onBlur={() => {
                    setIsEditingDescription(false)
                    if (localDescription !== description) {
                      onDescriptionChange?.(localDescription)
                    }
                  }}
                  className="text-sm border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 py-1"
                  placeholder="Form description"
                  autoFocus
                  dir="ltr"
                />
              ) : (
                <Textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onBlur={() => {
                    setIsEditingDescription(false)
                    if (localDescription !== description) {
                      onDescriptionChange?.(localDescription)
                    }
                  }}
                  className="text-sm font-medium text-gray-900 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 py-1 min-h-[60px] resize-none"
                  placeholder="Description"
                  autoFocus
                  dir="ltr"
                />
              )
            ) : (
              isFirstSection ? (
                <p 
                  className="text-sm text-gray-600 cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors min-h-[24px]"
                  onClick={() => setIsEditingDescription(true)}
                  dir="ltr"
                >
                  {localDescription || "Form description"}
                </p>
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
              )
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
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMove}>
                  <Move className="mr-2 h-4 w-4" />
                  Move Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMerge}>
                  <Merge className="mr-2 h-4 w-4" />
                  Merge with above
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
