"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateSurvey } from "@/lib/api"
import { useEffect, useState } from "react"

interface SurveyDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey?: {
    id: string
    title: string
    isOpen?: boolean
    description?: string
    is_active?: boolean
    periode?: string
  }
  onSave?: (data: {
    title: string
    isOpen: boolean
  }) => void
  onSuccess?: () => void // Callback after successful update
}

export function SurveyDetailDialog({ 
  open, 
  onOpenChange, 
  survey,
  onSave,
  onSuccess
}: SurveyDetailDialogProps) {
  const [title, setTitle] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update form when survey prop changes
  useEffect(() => {
    if (survey) {
      setTitle(survey.title || "")
      setIsOpen(survey.isOpen ?? survey.is_active ?? false)
    }
  }, [survey])

  const handleSave = async () => {
    if (!title) {
      setError("Please fill in the survey name")
      return
    }

    if (!survey?.id) {
      setError("Survey ID is missing")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Call API to update survey
      await updateSurvey(survey.id, {
        title,
        is_active: isOpen,
      })

      // Call the legacy onSave callback if provided
      if (onSave) {
        onSave({ title, isOpen })
      }

      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess()
      }

      // Close dialog
      onOpenChange(false)
    } catch (err) {
      console.error('Error updating survey:', err)
      setError(err instanceof Error ? err.message : 'Failed to update survey')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Survey Details</DialogTitle>
          <DialogDescription>
            Configure survey details.
          </DialogDescription>
        </DialogHeader>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          {/* Survey Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="survey-name">
              Survey Name
            </Label>
            <Input
              id="survey-name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey name"
              className="w-full"
            />
          </div>

          {/* Survey Status Switch */}
          <div className="grid gap-2">
            <Label htmlFor="survey-status">
              Survey Status
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="survey-status"
                checked={isOpen}
                onCheckedChange={setIsOpen}
              />
              <Label htmlFor="survey-status" className="text-sm">
                {isOpen ? "Open" : "Closed"}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title || isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}