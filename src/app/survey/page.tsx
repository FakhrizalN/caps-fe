"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { NewSurveyDialog, type SurveyFormData } from "@/components/new-survey-dialog"
import { SurveyCard } from "@/components/survey_card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { createPeriod, createSurvey, deletePeriod, deleteSurvey, getPeriods, getSurvey, getSurveys, updatePeriod, type Period, type Survey, type SurveyType } from "@/lib/api"
import { Check, ChevronDown, ChevronUp, Edit, Plus, Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SurveyManagementPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // State for surveys without periode
  const [surveysWithoutPeriode, setSurveysWithoutPeriode] = useState<Array<{
    id: string
    title: string
    description?: string
    lastEdit: string
    type: string
    is_active?: boolean
    survey_type?: SurveyType
    periode?: number | null
    start_at?: string | null
    end_at?: string | null
    isOpen?: boolean
  }>>([])
  
  // State untuk multiple sections (now synced with backend periods)
  const [sections, setSections] = useState<Array<{
    id: number // This is now periode ID from backend (negative for new/temporary)
    name: string
    order: number // Order from backend
    surveys: Array<{
      id: string
      title: string
      description?: string
      lastEdit: string
      type: string
      is_active?: boolean
      survey_type?: SurveyType
      periode?: number | null
      start_at?: string | null
      end_at?: string | null
      isOpen?: boolean
    }>
    isCollapsed: boolean
    isNew?: boolean // Flag for newly created sections not yet saved
    isModified?: boolean // Flag for modified sections
  }>>([])
  
  // Store all periods from backend
  const [allPeriods, setAllPeriods] = useState<Period[]>([])
  
  // Store sections to delete
  const [sectionsToDelete, setSectionsToDelete] = useState<number[]>([])

  // Fetch surveys and templates from API on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await fetchSurveys()
  }

  const fetchSurveys = async () => {
    try {
      setIsLoading(true)
      
      // Fetch both surveys and periods
      const [surveysData, periodsData] = await Promise.all([
        getSurveys(),
        getPeriods()
      ])
      
      setAllPeriods(periodsData)
      


      
      // Separate surveys without periode and with periode
      const withoutPeriode: any[] = []
      const surveysByPeriode: any = {}
      
      surveysData.forEach((survey: Survey) => {

        
        // Check if periode exists and get the ID
        const periodeId = survey.periode 
          ? (typeof survey.periode === 'object' ? (survey.periode as any).id : survey.periode)
          : null
        
        if (!periodeId) {
          // Survey without periode
          withoutPeriode.push({
            id: survey.id,
            title: survey.title,
            description: survey.description,
            lastEdit: survey.updated_at 
              ? `Last Edit ${new Date(survey.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
              : 'Never edited',
            type: survey.type || 'survey',
            is_active: survey.is_active,
            survey_type: survey.survey_type,
            periode: survey.periode,
            start_at: survey.start_at,
            end_at: survey.end_at,
            isOpen: survey.is_active
          })
        } else {
          // Survey with periode - use periode ID as key
          const periodeKey = periodeId.toString()
          if (!surveysByPeriode[periodeKey]) {
            surveysByPeriode[periodeKey] = []
          }
          surveysByPeriode[periodeKey].push({
            id: survey.id,
            title: survey.title,
            description: survey.description,
            lastEdit: survey.updated_at 
              ? `Last Edit ${new Date(survey.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
              : 'Never edited',
            type: survey.type || 'survey',
            is_active: survey.is_active,
            survey_type: survey.survey_type,
            periode: survey.periode,
            start_at: survey.start_at,
            end_at: survey.end_at,
            isOpen: survey.is_active
          })
        }
      })

      // Set surveys without periode
      setSurveysWithoutPeriode(withoutPeriode)



      // Convert to sections format using real periode data
      const newSections = periodsData
        .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
        .map((periode) => {
          const periodeKey = periode.id.toString()

          return {
            id: periode.id, // Use real periode ID
            name: periode.category || periode.name || `Periode ${periode.id}`,
            order: periode.order || 0,
            surveys: surveysByPeriode[periodeKey] || [],
            isCollapsed: false
          }
        })


      setSections(newSections)
      
    } catch (err) {
      console.error('Error fetching surveys:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to fetch surveys')
      
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

  }

  const handleDuplicate = async (surveyId: string) => {
    toast.promise(
      (async () => {
        // Fetch the complete survey data from API
        const surveyData = await getSurvey(surveyId)
        
        // Create a duplicate survey with modified title
        const duplicateData = {
          title: `${surveyData.title} (Copy)`,
          description: surveyData.description,
          is_active: surveyData.is_active,
          survey_type: surveyData.survey_type || 'exit',
          periode_id: surveyData.periode || null,
          start_at: surveyData.start_at,
          end_at: surveyData.end_at,
        }
        
        // Create the duplicate survey via API
        await createSurvey(duplicateData)
        
        // Refresh the survey list
        await fetchSurveys()
      })(),
      {
        loading: 'Duplicating survey...',
        success: 'Survey duplicated successfully',
        error: (err) => err instanceof Error ? err.message : 'Failed to duplicate survey',
      }
    )
  }

  const handleDeleteSurvey = async (surveyId: string) => {
    // Check if it's a survey without periode first
    const isSurveyWithoutPeriode = surveysWithoutPeriode.some(survey => survey.id === surveyId)
    
    if (isSurveyWithoutPeriode) {
      // Delete survey without periode from API
      toast.promise(
        (async () => {
          await deleteSurvey(surveyId)
          
          // Remove from local state
          setSurveysWithoutPeriode(prev => prev.filter(survey => survey.id !== surveyId))
          
          // Refresh surveys
          await fetchSurveys()
        })(),
        {
          loading: 'Deleting survey...',
          success: 'Survey deleted successfully',
          error: (err) => err instanceof Error ? err.message : 'Failed to delete survey',
        }
      )
      return
    }
    
    // Delete survey from API
    toast.promise(
      (async () => {
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
      })(),
      {
        loading: 'Deleting survey...',
        success: 'Survey deleted successfully',
        error: (err) => err instanceof Error ? err.message : 'Failed to delete survey',
      }
    )
  }

  const handleSave = async (data: SurveyFormData) => {
    try {
      

      
      // Prepare data for API
      const surveyData: any = {
        title: data.name,
        survey_type: data.survey_type || 'exit',
        is_active: false,
      }

      // Only add description if it exists and is not empty
      if (data.description && data.description.trim() !== '') {
        surveyData.description = data.description.trim()
      }

      // Handle periode_id - backend serializer requires this field
      if (data.periode && data.periode !== "none") {
        const periodeId = parseInt(data.periode)
        if (!isNaN(periodeId)) {
          surveyData.periode_id = periodeId
        } else {
          // If invalid, send null (backend should accept this after fix)
          surveyData.periode_id = null
        }
      } else {
        // If no periode selected, send null
        surveyData.periode_id = null
      }

      // Convert datetime to ISO format if present
      if (data.start_at && data.start_at.trim() !== '') {
        try {
          surveyData.start_at = new Date(data.start_at).toISOString()
        } catch (e) {
          console.error('Invalid start_at format:', data.start_at)
        }
      }

      if (data.end_at && data.end_at.trim() !== '') {
        try {
          surveyData.end_at = new Date(data.end_at).toISOString()
        } catch (e) {
          console.error('Invalid end_at format:', data.end_at)
        }
      }
      

      
      // Create survey via API
      const result = await createSurvey(surveyData)

      
      setIsDialogOpen(false)
      
      // Refresh surveys
      await fetchSurveys()
    } catch (err) {
      console.error('Error creating survey:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create survey')
    }
  }

  const handleEditMode = async () => {
    if (isEditMode) {
      // Switching from Edit mode to Done mode - save all changes
      try {
        setIsLoading(true)
        
        // 1. Delete marked sections first
        if (sectionsToDelete.length > 0) {
          await Promise.all(
            sectionsToDelete.map(id => deletePeriod(id))
          )
          setSectionsToDelete([])
        }
        
        // 2. Update orders with a two-phase approach to avoid conflicts
        const existingSections = sections.filter(s => !s.isNew && s.id > 0)
        
        if (existingSections.length > 0) {
          // Phase 1: Set all to temporary high orders (1000+) to avoid conflicts
          await Promise.all(
            existingSections.map((section, index) => 
              updatePeriod(section.id, {
                order: 1000 + index,
              })
            )
          )
          
          // Phase 2: Set to actual target orders
          await Promise.all(
            existingSections.map(section => 
              updatePeriod(section.id, {
                category: section.name,
                order: section.order,
              })
            )
          )
        }
        
        // 3. Create new sections last (after orders are updated)
        const newSections = sections.filter(s => s.isNew)
        if (newSections.length > 0) {
          await Promise.all(
            newSections.map(section => 
              createPeriod({
                category: section.name,
                order: section.order,
                is_active: true,
              })
            )
          )
        }
        
        // Refresh data after all changes
        await fetchSurveys()
        
      } catch (err) {
        console.error('Error saving changes:', err)
        toast.error(err instanceof Error ? err.message : 'Failed to save changes')
      } finally {
        setIsLoading(false)
      }
    }
    
    setIsEditMode(!isEditMode)
  }

  const handleDeleteSelected = () => {
    // Handle delete selected surveys

  }

  const handleDeleteSection = (sectionId: number) => {
    if (sectionId < 0) {
      // It's a new section that hasn't been saved yet, just remove from state
      setSections(prev => prev.filter(section => section.id !== sectionId))
    } else {
      // Mark for deletion (will be deleted when Done is clicked)
      setSectionsToDelete(prev => [...prev, sectionId])
      setSections(prev => prev.filter(section => section.id !== sectionId))
    }
  }

  const handleSectionNameChange = (sectionId: number, newName: string) => {
    // Just update local state, will save when Done is clicked
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, name: newName, isModified: true }
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
      
      // Swap positions
      const temp = newSections[currentIndex]
      newSections[currentIndex] = newSections[currentIndex - 1]
      newSections[currentIndex - 1] = temp
      
      // Update orders and mark as modified
      return newSections.map((section, index) => ({
        ...section,
        order: index + 1,
        isModified: !section.isNew, // Mark existing sections as modified
      }))
    })
  }

  const moveSectionDown = (sectionId: number) => {
    setSections(prev => {
      const currentIndex = prev.findIndex(section => section.id === sectionId)
      if (currentIndex >= prev.length - 1) return prev // Already at bottom
      
      const newSections = [...prev]
      
      // Swap positions
      const temp = newSections[currentIndex]
      newSections[currentIndex] = newSections[currentIndex + 1]
      newSections[currentIndex + 1] = temp
      
      // Update orders and mark as modified
      return newSections.map((section, index) => ({
        ...section,
        order: index + 1,
        isModified: !section.isNew, // Mark existing sections as modified
      }))
    })
  }

  const addNewSection = () => {
    // Generate temporary negative ID for new sections
    const newId = sections.length > 0 
      ? Math.min(...sections.map(s => s.id), 0) - 1 
      : -1
    
    const maxOrder = sections.length > 0
      ? Math.max(...sections.map(s => s.order))
      : 0
    
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    
    const newSection = {
      id: newId, // Negative ID indicates it's not saved yet
      name: `Periode ${currentYear}/${nextYear}`,
      order: maxOrder + 1,
      surveys: [],
      isCollapsed: false,
      isNew: true, // Mark as new
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
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Survey Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            
            <div className="flex flex-1 flex-col gap-8 p-8">
              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spinner className="size-8" />
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
                      className="pl-10 w-50 sm:w-70"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleEditMode}>
                    {isEditMode ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">Done</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">Edit</span>
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

              {/* Template Section - Now shows surveys without periode */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {surveysWithoutPeriode.map((survey) => (
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  onClick={addNewSection}
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
