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
import { useState } from "react"

interface SurveyDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  survey?: {
    id: string
    title: string
    fakultas?: string
    prodi?: string
    isOpen?: boolean
  }
  onSave: (data: {
    title: string
    fakultas: string
    prodi: string
    isOpen: boolean
  }) => void
}

const fakultasList = [
  "Faculty of Engineering",
  "Faculty of Economics and Business", 
  "Faculty of Computer Science",
  "Faculty of Medicine",
  "Faculty of Law",
  "Faculty of Psychology"
]

const prodiList: Record<string, string[]> = {
  "Faculty of Engineering": ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering"],
  "Faculty of Economics and Business": ["Management", "Accounting", "Economics"],
  "Faculty of Computer Science": ["Informatics", "Information Systems", "Computer Engineering"],
  "Faculty of Medicine": ["Medical Education", "Pharmacy", "Public Health"],
  "Faculty of Law": ["Law"],
  "Faculty of Psychology": ["Psychology"]
}

export function SurveyDetailDialog({ 
  open, 
  onOpenChange, 
  survey,
  onSave 
}: SurveyDetailDialogProps) {
  const [title, setTitle] = useState(survey?.title || "")
  const [fakultas, setFakultas] = useState(survey?.fakultas || "")
  const [prodi, setProdi] = useState(survey?.prodi || "")
  const [isOpen, setIsOpen] = useState(survey?.isOpen || false)

  const handleSave = () => {
    if (title && fakultas && prodi) {
      onSave({ title, fakultas, prodi, isOpen })
      onOpenChange(false)
    }
  }

  const handleFakultasChange = (value: string) => {
    setFakultas(value)
    setProdi("") // Reset prodi when fakultas changes
  }

  const availableProdi = fakultas ? prodiList[fakultas] || [] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Survey Details</DialogTitle>
          <DialogDescription>
            Configure survey details.
          </DialogDescription>
        </DialogHeader>
        
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

          {/* Faculty Select */}
          <div className="grid gap-2">
            <Label htmlFor="fakultas">
              Fakultas
            </Label>
            <Select value={fakultas} onValueChange={handleFakultasChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select fakultas" />
              </SelectTrigger>
              <SelectContent>
                {fakultasList.map((fak) => (
                  <SelectItem key={fak} value={fak}>
                    {fak}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Study Program Select */}
          <div className="grid gap-2">
            <Label htmlFor="prodi">
              Program Studi
            </Label>
            <Select 
              value={prodi} 
              onValueChange={setProdi}
              disabled={!fakultas}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select program studi" />
              </SelectTrigger>
              <SelectContent>
                {availableProdi.map((prod) => (
                  <SelectItem key={prod} value={prod}>
                    {prod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || !fakultas || !prodi}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}