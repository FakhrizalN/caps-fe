"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface QuestionHeaderCardProps {
  title: string
  description: string
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
}

export function QuestionHeaderCard({
  title,
  description,
  onTitleChange,
  onDescriptionChange
}: QuestionHeaderCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  return (
    <Card className="border-t-[6px] border-t-primary shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6 pb-4 space-y-2">
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
      </CardContent>
    </Card>
  )
}
