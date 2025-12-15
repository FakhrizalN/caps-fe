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
import { createDepartment, createFaculty, createProgramStudy } from "@/lib/api"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Fakultas, Jurusan } from "./columns"

interface AddUnitDialogProps {
  activeTab: string
  fakultasData: Fakultas[]
  jurusanData: Jurusan[]
}

export function AddUnitDialog({ activeTab, fakultasData, jurusanData }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedFakultas, setSelectedFakultas] = useState("")
  const [selectedJurusan, setSelectedJurusan] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setName("")
    setSelectedFakultas("")
    setSelectedJurusan("")
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
      if (activeTab === "fakultas") {
        await createFaculty({ name: name.trim() })
      } else if (activeTab === "jurusan") {
        await createDepartment({
          name: name.trim(),
          faculty: parseInt(selectedFakultas)
        })
      } else if (activeTab === "prodi") {
        await createProgramStudy({
          name: name.trim(),
          department: parseInt(selectedJurusan)
        })
      }
      
      // Reset form and close dialog
      resetForm()
      setOpen(false)
      
      // Refresh page to show new data
      window.location.reload()
    } catch (error) {
      console.error(`Error adding ${activeTab}:`, error)
      alert(`Failed to add ${activeTab}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (activeTab) {
      case "fakultas":
        return "Add New Fakultas"
      case "jurusan":
        return "Add New Jurusan"
      case "prodi":
        return "Add New Program Studi"
      default:
        return "Add New Unit"
    }
  }

  const getDescription = () => {
    switch (activeTab) {
      case "fakultas":
        return "Create a new fakultas for your institution."
      case "jurusan":
        return "Create a new jurusan under a fakultas."
      case "prodi":
        return "Create a new program studi under a fakultas."
      default:
        return "Create a new unit."
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

  const getButtonText = () => {
    switch (activeTab) {
      case "fakultas":
        return "Fakultas"
      case "jurusan":
        return "Jurusan"
      case "prodi":
        return "Program Studi"
      default:
        return "Unit"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{getButtonText()}</span>
        </Button>
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
                      <SelectItem key={fakultas.id} value={fakultas.id.toString()}>
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
                      <SelectItem key={jurusan.id} value={jurusan.id.toString()}>
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
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}