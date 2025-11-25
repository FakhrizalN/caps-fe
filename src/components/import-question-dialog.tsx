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
import { Download, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

interface ImportQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (file: File) => void
}

export function ImportQuestionDialog({
  open,
  onOpenChange,
  onImport
}: ImportQuestionDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = `question_text,question_type,description,is_required,option_1,option_2,option_3,option_4,option_5
"What is your name?",text,"Please enter your full name",true,,,,
"What is your age?",number,"Enter your age in years",true,,,,
"What is your gender?",radio,"Select your gender",true,Male,Female,Other,,
"What are your hobbies?",checkbox,"Select all that apply",false,Reading,Sports,Music,Art,Gaming
"Rate our service",scale,"Rate from 1 to 5",true,,,,
"Select your country",dropdown,"Choose from the list",true,Indonesia,Malaysia,Singapore,Thailand,Philippines`

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'question_import_template.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        alert('Please select a CSV file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Questions from CSV</DialogTitle>
          <DialogDescription>
            Download the template file, fill in your questions, and upload the completed CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Download Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 1: Download Template</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Download the CSV template file with the correct format and example questions.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>

            {/* Template Format Info */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Template Format:</h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>question_text:</strong> The question text (required)</li>
                <li><strong>question_type:</strong> text, number, radio, checkbox, scale, or dropdown (required)</li>
                <li><strong>description:</strong> Optional question description</li>
                <li><strong>is_required:</strong> true or false</li>
                <li><strong>option_1 to option_5:</strong> Answer options (for radio, checkbox, dropdown)</li>
              </ul>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 2: Upload CSV File</Label>
            <div className="border-2 border-dashed rounded-lg p-6">
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-green-900">{selectedFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <div className="text-center">
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <span className="text-primary hover:text-primary/80 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile}
          >
            Import Questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
