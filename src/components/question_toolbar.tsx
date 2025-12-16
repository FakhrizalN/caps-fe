"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  File,
  Share2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface QuestionToolbarProps {
  title?: string
  activeTab?: "questions" | "responses" | "program-study"
  isPreviewMode?: boolean
  surveyId?: string
  programStudyId?: string
  userRole?: string
  onTabChange?: (tab: "questions" | "responses" | "program-study") => void
  onPreviewToggle?: () => void
  onPublish?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export function QuestionToolbar({
  title = "Survey 1",
  activeTab = "questions",
  isPreviewMode = false,
  surveyId,
  programStudyId,
  userRole,
  onTabChange,
  onPreviewToggle,
  onPublish,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: QuestionToolbarProps) {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState(activeTab)

  // Debug: Log userRole to check its value
  useEffect(() => {
    console.log("QuestionToolbar - userRole:", userRole)
    console.log("QuestionToolbar - should hide program study?", userRole === "Tracer")
  }, [userRole])

  // Sync currentTab with activeTab prop when it changes
  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  // Log when programStudyId changes
  useEffect(() => {

  }, [programStudyId])

  const handleTabChange = (tab: "questions" | "responses" | "program-study") => {

    setCurrentTab(tab)
    onTabChange?.(tab)
    
    // Navigate based on tab - always use surveyId from URL if available
    if (tab === "questions") {
      if (surveyId) {
        router.push(`/survey/${surveyId}`)
      } else {
        router.push("/question")
      }
    } else if (tab === "responses") {
      if (surveyId) {
        router.push(`/survey/${surveyId}/response`)
      } else {
        router.push("/response")
      }
    } else if (tab === "program-study") {
      if (surveyId && programStudyId) {

        router.push(`/survey/${surveyId}/program-study/${programStudyId}`)
      } else {
        console.warn("Cannot navigate to program-study: missing surveyId or programStudyId", { surveyId, programStudyId })
      }
    }
  }

  return (
    <div className="sticky top-16 z-10 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Title - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-3 min-w-[200px]">
          <File className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-normal text-gray-900">{title}</h1>
        </div>

        {/* Mobile: Dropdown */}
        <div className="md:hidden flex-1">
          <Select value={currentTab} onValueChange={(value) => handleTabChange(value as any)}>
            <SelectTrigger className="w-full max-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="questions">Questions</SelectItem>
              {userRole !== "Tracer" && (
                <SelectItem value="program-study">Program Study</SelectItem>
              )}
              <SelectItem value="responses">Responses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tabs */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <button
            onClick={() => handleTabChange("questions")}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              currentTab === "questions" 
                ? "text-primary" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Questions
            {currentTab === "questions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => userRole !== "Tracer" && handleTabChange("program-study")}
            disabled={userRole === "Tracer"}
            className={`pb-3 text-sm font-medium relative whitespace-nowrap ${
              userRole === "Tracer"
                ? "text-gray-300 cursor-not-allowed"
                : currentTab === "program-study" 
                  ? "text-primary transition-colors" 
                  : "text-gray-600 hover:text-gray-900 transition-colors"
            }`}
          >
            Program Study Question
            {currentTab === "program-study" && userRole !== "Tracer" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => handleTabChange("responses")}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              currentTab === "responses" 
                ? "text-primary" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Responses
            {currentTab === "responses" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>

        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 min-w-[100px] md:min-w-[280px] justify-end">
          {/* <Button 
            variant="ghost" 
            size="icon" 
            title="Undo"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button> */}
          {/* <Button 
            variant="ghost" 
            size="icon" 
            title="Redo"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button> */}
          
          {/* Preview Toggle */}
          <Button 
            variant={isPreviewMode ? "default" : "ghost"}
            size="icon" 
            title="Preview"
            onClick={onPreviewToggle}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {/* Share button - Hidden on mobile */}
          <Button variant="ghost" size="icon" title="Share" className="hidden md:flex">
            <Share2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1 hidden md:block" />
          <Button onClick={onPublish} className="bg-primary hover:bg-primary/90">
            <span className="hidden sm:inline">Publish</span>
            <span className="sm:hidden">Publish</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
