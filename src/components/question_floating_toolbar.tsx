"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PlusCircle, Type, Upload, Minus } from "lucide-react"

interface QuestionFloatingToolbarProps {
  onAddQuestion?: () => void
  onAddText?: () => void
  onImportQuestion?: () => void
  onAddSection?: () => void
}

export function QuestionFloatingToolbar({
  onAddQuestion,
  onAddText,
  onImportQuestion,
  onAddSection
}: QuestionFloatingToolbarProps) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20">
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
                <Minus className="h-6 w-6 text-gray-600" />
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
