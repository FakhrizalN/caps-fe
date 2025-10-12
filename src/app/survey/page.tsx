"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { NewSurveyDialog, type SurveyFormData } from "@/components/new-survey-dialog"
import { SurveyCard } from "@/components/survey_card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Check, ChevronDown, ChevronUp, Edit, Plus, Search, Trash2 } from "lucide-react"
import { useState } from "react"

// Sample data untuk template surveys - now moved to state
const initialTemplateSurveys = [
  {
    id: "1",
    title: "Exit Survey IT",
    lastEdit: "Last Edit May 2024",
    type: "template"
  },
  {
    id: "2", 
    title: "Exit Survey SI",
    lastEdit: "Last Edit May 2024",
    type: "template"
  },
  {
    id: "3",
    title: "Tracer Study I-P",
    lastEdit: "Last Edit Sept 2024",
    type: "template"
  },
  {
    id: "4",
    title: "Tracer Study I-Si",
    lastEdit: "Last Edit Sept 2024", 
    type: "template"
  },
  {
    id: "5",
    title: "SPP IT",
    lastEdit: "Last Edit May 2024",
    type: "template"
  },
]

// Sample data untuk surveys periode
const initialSurveys = [
  {
    id: "6",
    title: "Exit Survey",
    lastEdit: "Last Edit May 2024",
    type: "survey"
  },
  {
    id: "7",
    title: "Exit Survey",
    lastEdit: "Last Edit May 2024",
    type: "survey"
  },
  {
    id: "8",
    title: "Exit Survey",
    lastEdit: "Last Edit - 1 year",
    type: "survey"
  },
  {
    id: "9",
    title: "Exit Survey",
    lastEdit: "Last Edit Nov 2022",
    type: "survey"
  },
  {
    id: "10",
    title: "Exit Survey",
    lastEdit: "Last Edit May 2023",
    type: "survey"
  },
]

export default function SurveyManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Add state for template surveys
  const [templateSurveys, setTemplateSurveys] = useState(initialTemplateSurveys)
  
  // State untuk multiple sections
  const [sections, setSections] = useState([
    {
      id: 1,
      name: "Periode 2022",
      surveys: initialSurveys,
      isCollapsed: false
    },
    {
      id: 2,
      name: "Periode 2021", 
      surveys: [
        {
          id: "11",
          title: "Exit Survey 2021",
          lastEdit: "Last Edit Dec 2021",
          type: "survey"
        },
        {
          id: "12",
          title: "Tracer Study 2021",
          lastEdit: "Last Edit Nov 2021", 
          type: "survey"
        }
      ],
      isCollapsed: false
    }
  ])

  const handleEdit = () => {
    // Handle edit action
    console.log("Edit survey")
  }

  const handleDuplicate = () => {
    // Handle duplicate action
    console.log("Duplicate survey")
  }

  const handleDeleteSurvey = (surveyId: string) => {
    // Check if it's a template survey first
    const isTemplate = templateSurveys.some(survey => survey.id === surveyId)
    
    if (isTemplate) {
      // Remove from template surveys
      setTemplateSurveys(prev => prev.filter(survey => survey.id !== surveyId))
    } else {
      // Remove from sections
      setSections(prev => 
        prev.map(section => ({
          ...section,
          surveys: section.surveys.filter(survey => survey.id !== surveyId)
        }))
      )
    }
  }

  const handleSave = (data: SurveyFormData) => {
    // Handle save action
    console.log("Save survey:", data)
    setIsDialogOpen(false)
  }

  const handleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  const handleDeleteSelected = () => {
    // Handle delete selected surveys
    console.log("Delete surveys")
  }

  const handleDeleteSection = (sectionId: number) => {
    setSections(prev => prev.filter(section => section.id !== sectionId))
  }

  const handleSectionNameChange = (sectionId: number, newName: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, name: newName }
          : section
      )
    )
  }

  const toggleSectionCollapse = (sectionId: number) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, isCollapsed: !section.isCollapsed }
          : section
      )
    )
  }

  const moveSectionUp = (sectionId: number) => {
    setSections(prev => {
      const currentIndex = prev.findIndex(section => section.id === sectionId)
      if (currentIndex <= 0) return prev // Already at top
      
      const newSections = [...prev]
      const temp = newSections[currentIndex]
      newSections[currentIndex] = newSections[currentIndex - 1]
      newSections[currentIndex - 1] = temp
      
      return newSections
    })
  }

  const moveSectionDown = (sectionId: number) => {
    setSections(prev => {
      const currentIndex = prev.findIndex(section => section.id === sectionId)
      if (currentIndex >= prev.length - 1) return prev // Already at bottom
      
      const newSections = [...prev]
      const temp = newSections[currentIndex]
      newSections[currentIndex] = newSections[currentIndex + 1]
      newSections[currentIndex + 1] = temp
      
      return newSections
    })
  }

  const addNewPeriode = () => {
    const newId = Math.max(...sections.map(s => s.id)) + 1
    const currentYear = new Date().getFullYear()
    const newSection = {
      id: newId,
      name: `Periode ${currentYear}`,
      surveys: [],
      isCollapsed: false
    }
    setSections(prev => [...prev, newSection])
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 !h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Survey Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Survey Management</h1>
              </div>

              {/* Controls Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleEditMode}>
                    {isEditMode ? (
                      <>
                        <Check className="h-4 w-4" />
                        Done
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                  
                  {/* New Survey Dialog Component */}
                  <NewSurveyDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSave={handleSave}
                  />
                </div>
              </div>

              {/* Template Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Template</h2>
                <div className="grid grid-cols-5 gap-4">
                  {templateSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      onEdit={handleEdit}
                      onDelete={handleDeleteSurvey}
                      isEditMode={isEditMode}
                    />
                  ))}
                </div>
              </div>

              {/* Dynamic Sections */}
              {sections.map((section, index) => (
                <div key={section.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    {/* Conditional rendering untuk title - editable saat edit mode */}
                    {isEditMode ? (
                      <Input
                        value={section.name}
                        onChange={(e) => handleSectionNameChange(section.id, e.target.value)}
                        className="max-w-fit"
                      />
                    ) : (
                      <h2 className="text-lg font-semibold">{section.name}</h2>
                    )}
                    
                    {isEditMode && (
                      <div className="flex gap-2">
                        {/* Chevron Up Button - disabled jika sudah di posisi pertama */}
                        <Button 
                          onClick={() => moveSectionUp(section.id)}
                          disabled={index === 0}
                          className={`px-4 py-2 rounded-lg border ${
                            index === 0
                              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          variant="outline"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        
                        {/* Chevron Down Button - disabled jika sudah di posisi terakhir */}
                        <Button 
                          onClick={() => moveSectionDown(section.id)}
                          disabled={index === sections.length - 1}
                          className={`px-4 py-2 rounded-lg border ${
                            index === sections.length - 1
                              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                          variant="outline"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>

                        {/* Delete Button - now deletes the specific section */}
                        <Button 
                          onClick={() => handleDeleteSection(section.id)}
                          variant="destructive"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    {section.surveys.map((survey) => (
                      <SurveyCard
                        key={survey.id}
                        survey={survey}
                        onEdit={handleEdit}
                        onDelete={handleDeleteSurvey}
                        isEditMode={isEditMode}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {isEditMode && (
              <div className="flex justify-start">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={addNewPeriode}
                  className="w-full border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}