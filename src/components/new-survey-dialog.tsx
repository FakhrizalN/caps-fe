"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useState } from "react"

interface NewSurveyDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: SurveyFormData) => void
}

export interface SurveyFormData {
  template: string
  name: string
  title?: string
  description?: string
  periode?: string
}

// Sample data untuk dropdown options
const templateOptions = [
  "Template 1",
  "Template 2", 
  "Template 3",
  "Template 4"
]

export function NewSurveyDialog({ isOpen, onOpenChange, onSave }: NewSurveyDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templateName, setTemplateName] = useState("")

  const handleSave = () => {
    const formData: SurveyFormData = {
      template: selectedTemplate,
      name: templateName
    }
    
    onSave(formData)
    
    // Reset form
    setSelectedTemplate("")
    setTemplateName("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    
    // Reset form
    setSelectedTemplate("")
    setTemplateName("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Survey
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Pilih Template */}
          <div className="grid gap-2">
            <Label htmlFor="template">
              Template <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input 
                    placeholder="Search..." 
                    className="mb-2"
                  />
                </div>
                {templateOptions.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nama Template */}
            <div className="grid gap-2">
            <Label htmlFor="name">
              Survey Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter survey name"
              className="w-full"
            />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}