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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getPeriods, updateSurvey, type SurveyType } from "@/lib/api"
import { useEffect, useState } from "react"

interface SurveyDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey?: {
    id: string
    title: string
    description?: string
    is_active?: boolean
    survey_type?: SurveyType
    periode?: number | null
    start_at?: string | null
    end_at?: string | null
    isOpen?: boolean
  }
  onSave?: (data: {
    title: string
    description?: string
    isOpen: boolean
    survey_type?: SurveyType
    periode?: number | null
    start_at?: string | null
    end_at?: string | null
  }) => void
  onSuccess?: () => void // Callback after successful update
}

const surveyTypeOptions: { value: SurveyType; label: string }[] = [
  { value: 'exit', label: 'Exit' },
  { value: 'lv1', label: 'Level 1' },
  { value: 'lv2', label: 'Level 2' },
  { value: 'skp', label: 'SKP' },
]

export function SurveyDetailDialog({ 
  open, 
  onOpenChange, 
  survey,
  onSave,
  onSuccess
}: SurveyDetailDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [surveyType, setSurveyType] = useState<SurveyType>("exit")
  const [selectedPeriode, setSelectedPeriode] = useState<string>("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [periodeOptions, setPeriodeOptions] = useState<Array<{ id: number; category?: string; name?: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch periods on component mount
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const periods = await getPeriods()
        setPeriodeOptions(periods)
      } catch (error) {
        console.error('Error fetching periods:', error)
      }
    }
    fetchPeriods()
  }, [])

  // Update form when survey prop changes
  useEffect(() => {
    if (survey) {
      setTitle(survey.title || "")
      setDescription(typeof survey.description === "string" ? survey.description : "")
      setIsActive(survey.isOpen ?? survey.is_active ?? false)
      setSurveyType(survey.survey_type || "exit")
      setSelectedPeriode(survey.periode ? survey.periode.toString() : "none")
      // Format datetime for input fields
      if (survey.start_at) {
        const startDate = new Date(survey.start_at)
        setStartAt(startDate.toISOString().slice(0, 16))
      } else {
        setStartAt("")
      }
      if (survey.end_at) {
        const endDate = new Date(survey.end_at)
        setEndAt(endDate.toISOString().slice(0, 16))
      } else {
        setEndAt("")
      }
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
      // Prepare data for API
      const updateData: any = {
        title,
        is_active: isActive,
        survey_type: surveyType,
        description: description && description.trim() !== '' ? description.trim() : null,
      }
      // Handle periode_id - backend serializer requires this field
      if (selectedPeriode && selectedPeriode !== "none") {
        const periodeId = parseInt(selectedPeriode)
        if (!isNaN(periodeId)) {
          updateData.periode_id = periodeId
        } else {
          updateData.periode_id = null
        }
      } else {
        updateData.periode_id = null
      }
      // Handle datetime fields - only send if they have values
      if (startAt && startAt.trim() !== '') {
        try {
          updateData.start_at = new Date(startAt).toISOString()
        } catch (e) {
          console.error('Invalid start_at format:', startAt)
        }
      }
      if (endAt && endAt.trim() !== '') {
        try {
          updateData.end_at = new Date(endAt).toISOString()
        } catch (e) {
          console.error('Invalid end_at format:', endAt)
        }
      }
      console.log('Updating survey with data:', updateData)
      // Call API to update survey
      await updateSurvey(survey.id, updateData)
      // Call the legacy onSave callback if provided
      if (onSave) {
        onSave({ 
          title, 
          description,
          isOpen: isActive,
          survey_type: surveyType,
          periode: selectedPeriode && selectedPeriode !== "none" ? parseInt(selectedPeriode) : null,
          start_at: startAt || null,
          end_at: endAt || null,
        })
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter survey description (optional)"
              className="w-full"
              rows={3}
            />
          </div>

          {/* Survey Type */}
          <div className="grid gap-2">
            <Label htmlFor="survey-type">Survey Type</Label>
            <Select value={surveyType} onValueChange={(value) => setSurveyType(value as SurveyType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select survey type" />
              </SelectTrigger>
              <SelectContent>
                {surveyTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Periode */}
          <div className="grid gap-2">
            <Label htmlFor="periode">Periode</Label>
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select periode (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {periodeOptions.map((periode) => (
                  <SelectItem key={periode.id} value={periode.id.toString()}>
                    {periode.category || periode.name || `Periode ${periode.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="grid gap-2">
            <Label htmlFor="start-at">Start Date</Label>
            <Input
              id="start-at"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full"
            />
          </div>

          {/* End Date */}
          <div className="grid gap-2">
            <Label htmlFor="end-at">End Date</Label>
            <Input
              id="end-at"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
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
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="survey-status" className="text-sm">
                {isActive ? "Active" : "Inactive"}
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