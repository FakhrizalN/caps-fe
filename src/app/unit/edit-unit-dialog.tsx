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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateFaculty, updateProgramStudy } from "@/lib/api"
import { Edit } from "lucide-react"
import { useEffect, useState } from "react"
import { Fakultas, ProgramStudi } from "./columns"

interface EditUnitDialogProps {
  activeTab: string
  fakultasData: Fakultas[]
  unitData: Fakultas | ProgramStudi
  trigger?: React.ReactNode
}

export function EditUnitDialog({ 
  activeTab, 
  fakultasData, 
  unitData,
  trigger
}: EditUnitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedFakultas, setSelectedFakultas] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with existing data
  useEffect(() => {
    console.log('EditUnitDialog - activeTab:', activeTab)
    console.log('EditUnitDialog - fakultasData:', fakultasData)
    console.log('EditUnitDialog - unitData:', unitData)
    
    if (unitData) {
      setName(unitData.name)
      
      // For program studi, get the faculty ID
      if (activeTab === "prodi" && 'faculty' in unitData) {
        setSelectedFakultas((unitData as ProgramStudi).faculty?.toString() || "")
      }
    }
  }, [unitData, activeTab, fakultasData])

  const resetForm = () => {
    setName(unitData?.name || "")
    if (activeTab === "prodi" && 'faculty' in unitData) {
      setSelectedFakultas((unitData as ProgramStudi).faculty?.toString() || "")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (activeTab === "prodi" && !selectedFakultas) {
      alert("Please select a fakultas")
      return
    }

    setIsLoading(true)
    
    try {
      if (activeTab === "fakultas") {
        await updateFaculty(unitData.id, { name: name.trim() })
      } else if (activeTab === "prodi") {
        await updateProgramStudy(unitData.id, {
          name: name.trim(),
          faculty: parseInt(selectedFakultas)
        })
      }
      
      // Close dialog
      setOpen(false)
      
      // Refresh page to show updated data
      window.location.reload()
    } catch (error) {
      console.error(`Error updating ${activeTab}:`, error)
      alert(`Failed to update ${activeTab}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (activeTab) {
      case "fakultas":
        return "Edit Fakultas"
      case "prodi":
        return "Edit Program Studi"
      default:
        return "Edit Unit"
    }
  }

  const getDescription = () => {
    switch (activeTab) {
      case "fakultas":
        return "Update the fakultas information."
      case "prodi":
        return "Update the program studi information."
      default:
        return "Update the unit information."
    }
  }

  const getNameLabel = () => {
    switch (activeTab) {
      case "fakultas":
        return "Fakultas Name"
      case "prodi":
        return "Program Studi Name"
      default:
        return "Name"
    }
  }

  const getNamePlaceholder = () => {
    switch (activeTab) {
      case "fakultas":
        return "Enter fakultas name"
      case "prodi":
        return "Enter program studi name"
      default:
        return "Enter name"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Fakultas Selection for Program Studi */}
            {activeTab === "prodi" && (
              <div className="space-y-2">
                <Label htmlFor="fakultas">Fakultas</Label>
                <Select value={selectedFakultas} onValueChange={setSelectedFakultas}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {fakultasData.map((fakultas) => (
                      <SelectItem key={fakultas.id} value={fakultas.id.toString()}>
                        {fakultas.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">{getNameLabel()}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getNamePlaceholder()}
                className="w-full"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}