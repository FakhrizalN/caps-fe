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
import { createSurvey, deleteSurvey, getSurveys, getTemplates, type Survey, type Template } from "@/lib/api"
import { Check, ChevronDown, ChevronUp, Edit, Plus, Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SurveyManagementPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for template surveys from API
  const [templateSurveys, setTemplateSurveys] = useState<Array<{
    id: string
    title: string
    lastEdit: string
    type: string
  }>>([])
  
  // State untuk multiple sections
  const [sections, setSections] = useState<Array<{
    id: number
    name: string
    surveys: Array<{
      id: string
      title: string
      lastEdit: string
      type: string
    }>
    isCollapsed: boolean
  }>>([])

  // Fetch surveys and templates from API on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchTemplates(), fetchSurveys()])
  }

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates()
      
      // Convert templates to card format
      const formattedTemplates = data.map((template: Template) => ({
        id: template.id,
        title: template.title,
        lastEdit: template.updated_at 
          ? `Last Edit ${new Date(template.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
          : 'Never edited',
        type: 'template'
      }))

      setTemplateSurveys(formattedTemplates)
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
      
      // If unauthorized, redirect to login
      if (err instanceof Error && err.message.includes('Session expired')) {
        router.push('/login')
      }
    }
  }

  const fetchSurveys = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSurveys()
      
      // Group surveys by periode
      const surveysByPeriode = data.reduce((acc: any, survey: Survey) => {
        const periode = survey.periode || 'Uncategorized'
        if (!acc[periode]) {
          acc[periode] = []
        }
        acc[periode].push({
          id: survey.id,
          title: survey.title,
          lastEdit: survey.updated_at 
            ? `Last Edit ${new Date(survey.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
            : 'Never edited',
          type: survey.type || 'survey'
        })
        return acc
      }, {})

      // Convert to sections format
      const newSections = Object.keys(surveysByPeriode).map((periode, index) => ({
        id: index + 1,
        name: periode,
        surveys: surveysByPeriode[periode],
        isCollapsed: false
      }))

      if (newSections.length > 0) {
        setSections(newSections)
      }
      
    } catch (err) {
      console.error('Error fetching surveys:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch surveys')
      
      // If unauthorized, redirect to login
      if (err instanceof Error && err.message.includes('Session expired')) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    // Handle edit action
    console.log("Edit survey")
  }

  const handleDuplicate = (surveyId: string) => {
    // Check if it's a template survey first
    const isTemplate = templateSurveys.some(survey => survey.id === surveyId)
    
    if (isTemplate) {
      // Duplicate template survey
      const surveyToDuplicate = templateSurveys.find(survey => survey.id === surveyId)
      if (surveyToDuplicate) {
        const newSurvey = {
          ...surveyToDuplicate,
          id: `template-${Date.now()}`, // Generate unique ID
          title: `${surveyToDuplicate.title} (Copy)`,
          lastEdit: `Last Edit ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
        }
        setTemplateSurveys(prev => [...prev, newSurvey])
      }
    } else {
      // Duplicate survey from sections
      setSections(prev => 
        prev.map(section => {
          const surveyToDuplicate = section.surveys.find(survey => survey.id === surveyId)
          if (surveyToDuplicate) {
            const newSurvey = {
              ...surveyToDuplicate,
              id: `survey-${Date.now()}`, // Generate unique ID
              title: `${surveyToDuplicate.title} (Copy)`,
              lastEdit: `Last Edit ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
            }
            return {
              ...section,
              surveys: [...section.surveys, newSurvey]
            }
          }
          return section
        })
      )
    }
  }

  const handleDeleteSurvey = async (surveyId: string) => {
    // Check if it's a template survey first
    const isTemplate = templateSurveys.some(survey => survey.id === surveyId)
    
    if (isTemplate) {
      // For templates, we might need a different API endpoint
      // For now, just remove from local state
      setTemplateSurveys(prev => prev.filter(survey => survey.id !== surveyId))
      return
    }
    
    // Delete survey from API
    try {
      await deleteSurvey(surveyId)
      
      // Remove from local state
      setSections(prev => 
        prev.map(section => ({
          ...section,
          surveys: section.surveys.filter(survey => survey.id !== surveyId)
        }))
      )
      
      // Refresh surveys
      await fetchSurveys()
    } catch (err) {
      console.error('Error deleting survey:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete survey')
    }
  }

  const handleSave = async (data: SurveyFormData) => {
    try {
      setError(null)
      
      // Create survey via API
      await createSurvey({
        title: data.name, // Using name as title from form
        periode: new Date().getFullYear().toString()
      })
      
      setIsDialogOpen(false)
      
      // Refresh surveys
      await fetchSurveys()
    } catch (err) {
      console.error('Error creating survey:', err)
      setError(err instanceof Error ? err.message : 'Failed to create survey')
    }
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
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading surveys...</div>
                </div>
              ) : (
                <>
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
                      onDuplicate={handleDuplicate}
                      isEditMode={isEditMode}
                      onUpdateSuccess={fetchSurveys}
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
                        onDuplicate={handleDuplicate}
                        isEditMode={isEditMode}
                        onUpdateSuccess={fetchSurveys}
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
                </>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}