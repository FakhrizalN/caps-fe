"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Copy, EllipsisVertical, Move, Trash } from "lucide-react"
import { useState } from "react"

interface QuestionHeaderCardProps {
  title: string
  description: string
  sectionNumber?: number
  totalSections?: number
  isActive?: boolean
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onDuplicate?: () => void
  onMove?: () => void
  onDelete?: () => void
}

export function QuestionHeaderCard({
  title,
  description,
  sectionNumber,
  totalSections,
  isActive = false,
  onTitleChange,
  onDescriptionChange,
  onDuplicate,
  onMove,
  onDelete
}: QuestionHeaderCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const showSectionBadge = sectionNumber !== undefined && totalSections !== undefined

  return (
    <div data-header-card="true">
      {/* Section Badge - only show when section info is provided */}
      {showSectionBadge && (
        <div className="w-fit h-12 bg-primary rounded-t-lg">
          <div className="px-[21px] py-[11px] text-white text-sm leading-5">
            Section {sectionNumber} of {totalSections}
          </div>
        </div>
      )}

      <Card className={`border-t-[8px] border-t-primary shadow-sm hover:shadow-md transition-all ${
        showSectionBadge ? 'mt-[-8px]' : ''
      } ${
        isActive ? 'border-l-4 border-l-primary' : ''
      }`}>
        <CardContent className="pt-6 pb-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {/* Judul survey */}
              {isEditingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => onTitleChange?.(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  className="text-3xl font-normal border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 py-1"
                  autoFocus
                  dir="ltr"
                />
              ) : (
                <h1 
                  className="text-3xl font-normal cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                  dir="ltr"
                >
                  {title}
                </h1>
              )}

              {/* Deskripsi  */}
              {isEditingDescription ? (
                <Input
                  value={description}
                  onChange={(e) => onDescriptionChange?.(e.target.value)}
                  onBlur={() => setIsEditingDescription(false)}
                  className="text-sm border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 py-1"
                  placeholder="Form description"
                  autoFocus
                  dir="ltr"
                />
              ) : (
                <p 
                  className="text-sm text-gray-600 cursor-text hover:bg-gray-50 px-1 py-1 -mx-1 rounded transition-colors min-h-[24px]"
                  onClick={() => setIsEditingDescription(true)}
                  dir="ltr"
                >
                  {description || "Form description"}
                </p>
              )}
            </div>

            {/* Action Menu - only show when section info is provided */}
            {showSectionBadge && (
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
