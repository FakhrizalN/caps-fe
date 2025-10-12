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
import { Edit } from "lucide-react"
import { useEffect, useState } from "react"
import { Fakultas, Jurusan, ProgramStudi } from "./columns"

interface EditUnitDialogProps {
  activeTab: string
  fakultasData: Fakultas[]
  jurusanData: Jurusan[]
  unitData: Fakultas | Jurusan | ProgramStudi
  trigger?: React.ReactNode
}

export function EditUnitDialog({ 
  activeTab, 
  fakultasData, 
  jurusanData, 
  unitData,
  trigger
}: EditUnitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedFakultas, setSelectedFakultas] = useState("")
  const [selectedJurusan, setSelectedJurusan] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with existing data
  useEffect(() => {
    if (unitData) {
      setName(unitData.name)
      
      // For jurusan, get the fakultas ID (you would get this from your data)
      if (activeTab === "jurusan" && 'fakultasId' in unitData) {
        setSelectedFakultas((unitData as any).fakultasId || "")
      }
      
      // For program studi, get the jurusan ID (you would get this from your data)
      if (activeTab === "prodi" && 'jurusanId' in unitData) {
        setSelectedJurusan((unitData as any).jurusanId || "")
      }
    }
  }, [unitData, activeTab])

  const resetForm = () => {
    setName(unitData?.name || "")
    if (activeTab === "jurusan" && 'fakultasId' in unitData) {
      setSelectedFakultas((unitData as any).fakultasId || "")
    }
    if (activeTab === "prodi" && 'jurusanId' in unitData) {
      setSelectedJurusan((unitData as any).jurusanId || "")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (activeTab === "jurusan" && !selectedFakultas) {
      alert("Please select a fakultas")
      return
    }

    if (activeTab === "prodi" && !selectedJurusan) {
      alert("Please select a jurusan")
      return
    }

    setIsLoading(true)
    
    try {
      const updatedUnit = {
        id: unitData.id,
        name: name.trim(),
        ...(activeTab === "jurusan" && { fakultasId: selectedFakultas }),
        ...(activeTab === "prodi" && { jurusanId: selectedJurusan }),
      }

      console.log(`Updating ${activeTab}:`, updatedUnit)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
      case "jurusan":
        return "Edit Jurusan"
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
      case "jurusan":
        return "Update the jurusan information."
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
      case "jurusan":
        return "Jurusan Name"
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
      case "jurusan":
        return "Enter jurusan name"
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
            {/* Fakultas Selection for Jurusan */}
            {activeTab === "jurusan" && (
              <div className="space-y-2">
                <Label htmlFor="fakultas">Fakultas</Label>
                <Select value={selectedFakultas} onValueChange={setSelectedFakultas}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {fakultasData.map((fakultas) => (
                      <SelectItem key={fakultas.id} value={fakultas.id}>
                        {fakultas.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Jurusan Selection for Program Studi */}
            {activeTab === "prodi" && (
              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan</Label>
                <Select value={selectedJurusan} onValueChange={setSelectedJurusan}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurusanData.map((jurusan) => (
                      <SelectItem key={jurusan.id} value={jurusan.id}>
                        {jurusan.name}
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