"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlignVerticalSpaceAround, PlusCircle, Type, Upload } from "lucide-react"
import { useEffect, useState } from "react"

interface QuestionFloatingToolbarProps {
  onAddQuestion?: () => void
  onAddText?: () => void
  onImportQuestion?: () => void
  onAddSection?: () => void
  activeQuestionId?: number | string | null
  activeElementType?: 'question' | 'header' | 'section'
}

export function QuestionFloatingToolbar({
  onAddQuestion,
  onAddText,
  onImportQuestion,
  onAddSection,
  activeQuestionId,
  activeElementType = 'question'
}: QuestionFloatingToolbarProps) {
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    right: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
  })

  useEffect(() => {
    const updateToolbarPosition = () => {
      if (!activeQuestionId) {
        // Default center position
        setToolbarStyle({
          position: 'fixed',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
        })
        return
      }

      // Select element based on type
      let targetElement: Element | null = null
      if (activeElementType === 'question') {
        targetElement = document.querySelector(`[data-question-id="${activeQuestionId}"]`)
      } else if (activeElementType === 'header') {
        targetElement = document.querySelector(`[data-header-card="true"]`)
      } else if (activeElementType === 'section') {
        targetElement = document.querySelector(`[data-section-id="${activeQuestionId}"]`)
      }
      
      if (!targetElement) return
      const questionElement = targetElement

      const rect = questionElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const toolbarHeight = 300 // Approximate toolbar height

      // For header type, align to top. For others (question/section), align to center
      let targetPosition: number
      if (activeElementType === 'header') {
        // Align to top of header card
        targetPosition = rect.top
      } else {
        // Calculate the center of the element
        targetPosition = rect.top + rect.height / 2
      }

      // Check if element is in viewport
      const isInViewport = rect.top >= 0 && rect.bottom <= viewportHeight

      if (isInViewport) {
        // Element is visible - position toolbar accordingly
        if (activeElementType === 'header') {
          // For header, align to top without centering transform
          setToolbarStyle({
            position: 'fixed',
            right: '1.5rem',
            top: `${targetPosition}px`,
            transform: 'none',
          })
        } else {
          // For question/section, center vertically
          setToolbarStyle({
            position: 'fixed',
            right: '1.5rem',
            top: `${targetPosition}px`,
            transform: 'translateY(-50%)',
          })
        }
      } else if (rect.top < 0) {
        // Element is above viewport - stick to top
        setToolbarStyle({
          position: 'fixed',
          right: '1.5rem',
          top: '9rem', // Below header
          transform: 'none',
        })
      } else {
        // Element is below viewport - stick to bottom
        setToolbarStyle({
          position: 'fixed',
          right: '1.5rem',
          bottom: '2rem',
          transform: 'none',
        })
      }
    }

    // Update on mount, scroll, and when active question changes
    updateToolbarPosition()
    window.addEventListener('scroll', updateToolbarPosition)
    window.addEventListener('resize', updateToolbarPosition)

    return () => {
      window.removeEventListener('scroll', updateToolbarPosition)
      window.removeEventListener('resize', updateToolbarPosition)
    }
  }, [activeQuestionId, activeElementType])

  return (
    <div style={toolbarStyle} className="z-20 transition-all duration-200">
      <div className="bg-white border rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onAddQuestion}
                className="h-12 w-12 hover:bg-gray-100"
              >
                <PlusCircle className="h-6 w-6 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Add Question</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onAddText}
                className="h-12 w-12 hover:bg-gray-100"
              >
                <Type className="h-6 w-6 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Add Text</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onImportQuestion}
                className="h-12 w-12 hover:bg-gray-100"
              >
                <Upload className="h-6 w-6 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Import Question</p>
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="border-t my-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onAddSection}
                className="h-12 w-12 hover:bg-gray-100"
              >
                <AlignVerticalSpaceAround className="h-6 w-6 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Add Section</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
