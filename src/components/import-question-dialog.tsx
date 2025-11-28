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
import { createQuestion, CreateQuestionData, createSection, getSections } from "@/lib/api"
import { Download, Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import * as XLSX from 'xlsx'

interface ImportQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  surveyId: number
  sectionId: number
  onSuccess?: () => void
}

export function ImportQuestionDialog({
  open,
  onOpenChange,
  surveyId,
  sectionId,
  onSuccess
}: ImportQuestionDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    // Create Excel data as array of arrays
    const headers = ['section_title', 'section_description', 'text', 'question_type', 'description', 'is_required', 'code', 'source', 'order', 'option_1', 'option_2', 'option_3', 'option_4', 'option_5']
    
    const rows = [
      ['Personal Information', 'Basic information about yourself', 'What is your name?', 'text', 'Please enter your full name', true, 'Q001', 'Template', 1, '', '', '', '', ''],
      ['Personal Information', 'Basic information about yourself', 'What is your age?', 'number', 'Enter your age in years', true, 'Q002', 'Template', 2, '', '', '', '', ''],
      ['Personal Information', 'Basic information about yourself', 'What is your gender?', 'radio', 'Select your gender', true, 'Q003', 'Template', 3, 'Male', 'Female', 'Other', '', ''],
      ['Preferences', 'Your interests and preferences', 'What are your hobbies?', 'checkbox', 'Select all that apply', false, 'Q004', 'Template', 4, 'Reading', 'Sports', 'Music', 'Art', 'Gaming'],
      ['Feedback', 'Your feedback about our service', 'Rate our service', 'scale', 'Rate from 1 to 5', true, 'Q005', 'Template', 5, '', '', '', '', ''],
      ['Location', 'Your location information', 'Select your country', 'dropdown', 'Choose from the list', true, 'Q006', 'Template', 6, 'Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Philippines']
    ]

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // section_title
      { wch: 35 }, // section_description
      { wch: 30 }, // text
      { wch: 15 }, // question_type
      { wch: 30 }, // description
      { wch: 12 }, // is_required
      { wch: 10 }, // code
      { wch: 12 }, // source
      { wch: 8 },  // order
      { wch: 15 }, // option_1
      { wch: 15 }, // option_2
      { wch: 15 }, // option_3
      { wch: 15 }, // option_4
      { wch: 15 }, // option_5
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')

    // Generate Excel file and download
    XLSX.writeFile(wb, 'question_import_template.xlsx')
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please select an Excel file (.xlsx or .xls)')
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

  interface ParsedQuestionData extends CreateQuestionData {
    section_title?: string
    section_description?: string
  }

  const parseExcel = (file: File): Promise<ParsedQuestionData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
          
          if (jsonData.length < 2) {
            resolve([])
            return
          }

          const headers = jsonData[0].map((h: any) => String(h).trim())
          const questions: ParsedQuestionData[] = []

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            const rowData: Record<string, any> = {}
            
            headers.forEach((header, index) => {
              rowData[header] = row[index] !== undefined ? row[index] : ''
            })

            // Collect options from option_1 to option_5
            const options: string[] = []
            for (let j = 1; j <= 5; j++) {
              const optionValue = rowData[`option_${j}`]
              if (optionValue && String(optionValue).trim()) {
                options.push(String(optionValue).trim())
              }
            }

            const questionData: ParsedQuestionData = {
              section_title: String(rowData.section_title || '').trim(),
              section_description: String(rowData.section_description || '').trim(),
              text: String(rowData.text || '').trim(),
              question_type: String(rowData.question_type || 'text').trim(),
              description: String(rowData.description || '').trim(),
              is_required: rowData.is_required === true || String(rowData.is_required).toLowerCase() === 'true',
              code: String(rowData.code || '').trim(),
              source: String(rowData.source || '').trim(),
              order: typeof rowData.order === 'number' ? rowData.order : parseInt(String(rowData.order)) || 0,
              options: options.length > 0 ? options : undefined
            }

            if (questionData.text) {
              questions.push(questionData)
            }
          }

          resolve(questions)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsBinaryString(file)
    })
  }

  const importQuestions = async (file: File) => {
    setIsImporting(true)
    try {
      // Validate surveyId and sectionId
      if (!surveyId || !sectionId) {
        alert('Invalid survey or section. Please try again.')
        setIsImporting(false)
        return
      }

      const questions = await parseExcel(file)

      if (questions.length === 0) {
        alert('No valid questions found in Excel file')
        setIsImporting(false)
        return
      }

      // Get existing sections
      const existingSections = await getSections(surveyId)
      
      // Track sections (title -> section ID)
      const sectionMap = new Map<string, number>()
      existingSections.forEach(section => {
        sectionMap.set(section.title.toLowerCase(), section.id)
      })

      // Import questions, creating sections as needed
      let successCount = 0
      let errorCount = 0
      let sectionOrder = Math.max(...existingSections.map(s => s.order), 0)

      for (const questionData of questions) {
        try {
          let targetSectionId = sectionId

          // If section_title is provided, create or reuse section
          if (questionData.section_title) {
            const sectionKey = questionData.section_title.toLowerCase()
            
            if (sectionMap.has(sectionKey)) {
              // Use existing section
              targetSectionId = sectionMap.get(sectionKey)!
            } else {
              // Create new section
              sectionOrder++
              const newSection = await createSection(surveyId, {
                title: questionData.section_title,
                description: questionData.section_description || '',
                order: sectionOrder
              })
              targetSectionId = newSection.id
              sectionMap.set(sectionKey, newSection.id)
            }
          }

          // Remove section fields from question data before creating
          const { section_title, section_description, ...questionOnlyData } = questionData

          await createQuestion(surveyId, targetSectionId, questionOnlyData)
          successCount++
        } catch (error) {
          console.error('Error importing question:', error)
          errorCount++
        }
      }

      if (successCount > 0) {
        alert(`Successfully imported ${successCount} question(s).${errorCount > 0 ? ` ${errorCount} failed.` : ''}`)
        if (onSuccess) {
          onSuccess()
        }
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onOpenChange(false)
      } else {
        alert('Failed to import questions. Please check the Excel format.')
      }
    } catch (error) {
      console.error('Error reading Excel file:', error)
      alert('Error reading Excel file. Please check the file format.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      importQuestions(selectedFile)
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
          <DialogTitle>Import Questions from Excel</DialogTitle>
          <DialogDescription>
            Download the template file, fill in your questions with sections, and upload the completed Excel file.
            Questions with the same section_title will be grouped together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Download Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 1: Download Template</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Download the Excel template file with the correct format and example questions.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Excel Template
              </Button>
            </div>

            {/* Template Format Info */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Template Format:</h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>section_title:</strong> Title of the section (optional - creates/reuses section)</li>
                <li><strong>section_description:</strong> Description of the section (optional)</li>
                <li><strong>text:</strong> The question text (required)</li>
                <li><strong>question_type:</strong> text, number, radio, checkbox, scale, or dropdown (required)</li>
                <li><strong>description:</strong> Optional question description</li>
                <li><strong>is_required:</strong> true or false (default: false)</li>
                <li><strong>code:</strong> Question code/identifier (optional)</li>
                <li><strong>source:</strong> Source of the question (optional)</li>
                <li><strong>order:</strong> Display order number (required)</li>
                <li><strong>option_1 to option_5:</strong> Answer options (for radio, checkbox, dropdown)</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2 italic">
                💡 Tip: Questions with the same section_title will be grouped in the same section. 
                Leave section_title empty to use the current section.
              </p>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 2: Upload Excel File</Label>
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
                    <Label htmlFor="excel-upload" className="cursor-pointer">
                      <span className="text-primary hover:text-primary/80 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">Excel files only (.xlsx, .xls)</p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="excel-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import Questions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
