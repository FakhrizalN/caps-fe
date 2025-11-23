"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Section } from "@/lib/api"
import { GripVertical, Trash2 } from "lucide-react"
import { useState } from "react"

interface SectionCardProps {
  section: Section
  onUpdate: (sectionId: number, data: { title?: string; description?: string }) => void
  onDelete: (sectionId: number) => void
  onFocus?: () => void
  children?: React.ReactNode
}

export function SectionCard({ section, onUpdate, onDelete, onFocus, children }: SectionCardProps) {
  const [title, setTitle] = useState(section.title)
  const [description, setDescription] = useState(section.description || "")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (title !== section.title) {
      onUpdate(section.id, { title })
    }
  }

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false)
    if (description !== section.description) {
      onUpdate(section.id, { description })
    }
  }

  return (
    <Card className="mb-6" onClick={() => onFocus?.()}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-start gap-3 flex-1">
          <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
          <div className="flex-1 space-y-2">
            {isEditingTitle ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleTitleBlur()
                  }
                }}
                className="text-xl font-semibold"
                autoFocus
              />
            ) : (
              <h3
                className="text-xl font-semibold cursor-pointer hover:bg-accent/50 px-2 py-1 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h3>
            )}
            
            {isEditingDescription ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Section description (optional)"
                className="min-h-[60px]"
                autoFocus
              />
            ) : (
              <p
                className="text-sm text-muted-foreground cursor-pointer hover:bg-accent/50 px-2 py-1 rounded min-h-[24px]"
                onClick={() => setIsEditingDescription(true)}
              >
                {description || "Click to add description"}
              </p>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(section.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}
