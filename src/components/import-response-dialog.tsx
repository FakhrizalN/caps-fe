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
import { getQuestions, getSections } from "@/lib/api"
import { Download, Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import * as XLSX from 'xlsx'

interface ImportResponseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  surveyId: number
  onSuccess?: () => void
}

export function ImportResponseDialog({
  open,
  onOpenChange,
  surveyId,
  onSuccess
}: ImportResponseDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = async () => {
    try {
      // Fetch sections and questions
      const sections = await getSections(surveyId)
      const allQuestions = []
      
      for (const section of sections) {
        const sectionQuestions = await getQuestions(surveyId, section.id)
        allQuestions.push(...sectionQuestions)
      }

      // Sort by order
      const sortedQuestions = allQuestions.sort((a, b) => a.order - b.order)
      
      // Create header row
      const headers = ['Nama Prodi', 'Nama', 'Email']
      sortedQuestions.forEach(q => {
        const code = q.code || `Q${q.id}`
        headers.push(code)
      })

      // Create sample data row
      const sampleRow = [
        'Teknik Informatika',
        'John Doe',
        'john.doe@example.com'
      ]
      
      // Add sample answers based on question type
      sortedQuestions.forEach(q => {
        switch (q.question_type) {
          case 'text':
            sampleRow.push('Sample text answer')
            break
          case 'number':
            sampleRow.push('25')
            break
          case 'scale':
            sampleRow.push('4')
            break
          case 'radio':
          case 'dropdown':
            // Get first option
            let options = []
            if (typeof q.options === 'string') {
              try {
                options = JSON.parse(q.options)
              } catch {
                options = []
              }
            } else if (Array.isArray(q.options)) {
              options = q.options
            }
            sampleRow.push(options.length > 0 ? (typeof options[0] === 'string' ? options[0] : options[0].label || options[0]) : 'Option 1')
            break
          case 'checkbox':
            // Multiple options comma-separated
            let cbOptions = []
            if (typeof q.options === 'string') {
              try {
                cbOptions = JSON.parse(q.options)
              } catch {
                cbOptions = []
              }
            } else if (Array.isArray(q.options)) {
              cbOptions = q.options
            }
            if (cbOptions.length > 0) {
              const opt1 = typeof cbOptions[0] === 'string' ? cbOptions[0] : cbOptions[0].label || cbOptions[0]
              const opt2 = cbOptions.length > 1 ? (typeof cbOptions[1] === 'string' ? cbOptions[1] : cbOptions[1].label || cbOptions[1]) : ''
              sampleRow.push(opt2 ? `${opt1}, ${opt2}` : opt1)
            } else {
              sampleRow.push('Option 1, Option 2')
            }
            break
          default:
            sampleRow.push('Sample answer')
        }
      })

      // Create workbook
      const wb = XLSX.utils.book_new()
      const wsData = [headers, sampleRow]
      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Nama Prodi
        { wch: 25 }, // Nama
        { wch: 30 }, // Email
      ]
      
      sortedQuestions.forEach(() => {
        colWidths.push({ wch: 20 })
      })
      
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Responses')
      XLSX.writeFile(wb, `survey_${surveyId}_response_template.xlsx`)
    } catch (error) {
      console.error('Error generating template:', error)
      alert('Gagal membuat template. Silakan coba lagi.')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
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

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
          
          if (jsonData.length < 2) {
            resolve([])
            return
          }

          const headers = jsonData[0].map((h: any) => String(h).trim())
          const responses: any[] = []

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            const rowData: Record<string, any> = {}
            
            headers.forEach((header, index) => {
              rowData[header] = row[index] !== undefined ? row[index] : ''
            })

            if (rowData['Email'] && String(rowData['Email']).trim()) {
              responses.push(rowData)
            }
          }

          resolve(responses)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsBinaryString(file)
    })
  }

  const importResponses = async (file: File) => {
    setIsImporting(true)
    try {
      const responses = await parseExcel(file)

      if (responses.length === 0) {
        alert('No valid responses found in Excel file')
        setIsImporting(false)
        return
      }

      // TODO: Implement API call to import responses
      
      alert(`Ready to import ${responses.length} response(s). API integration coming soon.`)
      
      if (onSuccess) {
        onSuccess()
      }
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error reading Excel file:', error)
      alert('Error reading Excel file. Please check the file format.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      importResponses(selectedFile)
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
          <DialogTitle>Import Responses from Excel</DialogTitle>
          <DialogDescription>
            Download the template file, fill in the responses, and upload the completed Excel file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Download Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 1: Download Template</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Download the Excel template file with the correct format based on this survey's questions.
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

            <div className="hidden md:block border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Template Format:</h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Nama Prodi:</strong> Program study name of the respondent</li>
                <li><strong>Nama:</strong> Full name of the respondent</li>
                <li><strong>Email:</strong> Email address (required)</li>
                <li><strong>Question Columns:</strong> Answer for each question based on question code</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2 italic">
                💡 Tip: For checkbox questions, separate multiple answers with commas.
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
            {isImporting ? 'Importing...' : 'Import Responses'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
