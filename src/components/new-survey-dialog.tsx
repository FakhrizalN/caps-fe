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
import { Textarea } from "@/components/ui/textarea"
import { getPeriods, type SurveyType } from "@/lib/api"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

interface NewSurveyDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: SurveyFormData) => void
}

export interface SurveyFormData {
  name: string
  description?: string
  survey_type?: SurveyType
  periode?: string | null
  start_at?: string | null
  end_at?: string | null
}

const surveyTypeOptions: { value: SurveyType; label: string }[] = [
  { value: 'exit', label: 'Exit' },
  { value: 'lv1', label: 'Level 1' },
  { value: 'lv2', label: 'Level 2' },
  { value: 'skp', label: 'SKP' },
]

export function NewSurveyDialog({ isOpen, onOpenChange, onSave }: NewSurveyDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [surveyType, setSurveyType] = useState<SurveyType>("exit")
  const [selectedPeriode, setSelectedPeriode] = useState<string>("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [periodeOptions, setPeriodeOptions] = useState<Array<{ id: number; category?: string; name?: string }>>([])

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

  const handleSave = () => {
    const formData: SurveyFormData = {
      name: title,
      description: description || undefined,
      survey_type: surveyType,
      periode: selectedPeriode && selectedPeriode !== "none" ? selectedPeriode : null,
      start_at: startAt || null,
      end_at: endAt || null,
    }
    

    
    onSave(formData)
    
    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSurveyType("exit")
    setSelectedPeriode("")
    setStartAt("")
    setEndAt("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          
          <span className="hidden sm:inline ml-2">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Survey
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Survey Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Survey Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
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
            <Label htmlFor="survey-type">
              Survey Type <span className="text-red-500">*</span>
            </Label>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
