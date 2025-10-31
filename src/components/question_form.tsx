"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useState } from "react"
import { QuestionType } from "./question_card"

export interface QuestionFormData {
  title: string
  description?: string
  type: QuestionType
}

interface QuestionFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave: (data: QuestionFormData) => void
}

export function QuestionForm({ open, onOpenChange, onSave }: QuestionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<QuestionFormData>({
    title: "",
    description: "",
    type: "multiple_choice"
  })

  const handleOpen = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
    
    if (!value) {
      setFormData({ title: "", description: "", type: "multiple_choice" })
    }
  }

  const handleSave = () => {
    if (formData.title.trim()) {
      onSave(formData)
      handleOpen(false)
    }
  }

  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || handleOpen

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your survey
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">
              Question Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter your question"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add additional context"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.title.trim()}>
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
