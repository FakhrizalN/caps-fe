"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  File,
  Redo2,
  Share2,
  Undo2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface QuestionToolbarProps {
  title?: string
  activeTab?: "questions" | "responses" | "settings"
  isPreviewMode?: boolean
  surveyId?: string
  onTabChange?: (tab: "questions" | "responses" | "settings") => void
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

  const handleTabChange = (tab: "questions" | "responses" | "settings") => {
    setCurrentTab(tab)
    onTabChange?.(tab)
    
    // Navigate based on tab
    if (surveyId) {
      if (tab === "questions") {
        router.push(`/survey/${surveyId}`)
      } else if (tab === "responses") {
        router.push(`/survey/${surveyId}/response`)
      }
    } else {
      // Fallback to old routes if no surveyId
      if (tab === "questions") {
        router.push("/question")
      } else if (tab === "responses") {
        router.push("/response")
      }
    }
    // Settings tab doesn't navigate
  }

  return (
    <div className="sticky top-16 z-10 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3 min-w-[200px]">
          <File className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-normal text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-8 flex-1 justify-center">
          <button
            onClick={() => handleTabChange("questions")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
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
            onClick={() => handleTabChange("responses")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
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
          <button
            onClick={() => handleTabChange("settings")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              currentTab === "settings" 
                ? "text-primary" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Settings
            {currentTab === "settings" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 min-w-[280px] justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            title="Undo"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Redo"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          
          {/* Preview Toggle */}
          <Button 
            variant={isPreviewMode ? "default" : "ghost"}
            size="icon" 
            title="Preview"
            onClick={onPreviewToggle}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" title="Share">
            <Share2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button onClick={onPublish} className="bg-primary hover:bg-primary/90">
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}
