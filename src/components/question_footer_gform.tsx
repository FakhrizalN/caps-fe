"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Copy, FileText, MoreVertical, ShieldCheck, Trash2 } from "lucide-react"
import { useState } from "react"

interface QuestionFooterProps {
  required: boolean
  questionId: string
  questionType?: string
  showDescription?: boolean
  responseValidation?: boolean
  onRequiredChange?: (required: boolean) => void
  onDuplicate?: () => void
  onDelete?: () => void
  onDescriptionToggle?: (show: boolean) => void
  onResponseValidationToggle?: (enabled: boolean) => void
}

export function QuestionFooterGForm({
  required,
  questionId,
  questionType,
  showDescription = false,
  responseValidation = false,
  onRequiredChange,
  onDuplicate,
  onDelete,
  onDescriptionToggle,
  onResponseValidationToggle
}: QuestionFooterProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDescriptionClick = () => {
    onDescriptionToggle?.(!showDescription)
    setMenuOpen(false)
  }

  const handleResponseValidationClick = () => {
    onResponseValidationToggle?.(!responseValidation)
    setMenuOpen(false)
  }

  return (
    <div className="flex justify-between items-center border-t pt-4">
      <div className="flex gap-2 items-center">
        {/* Duplicate Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-gray-100"
          onClick={onDuplicate}
          title="Duplicate"
        >
          <Copy className="h-4 w-4 text-gray-600" />
        </Button>

        {/* Delete Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-gray-100"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-gray-600" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Required Toggle */}
        <div className="flex items-center gap-2">
          <Label htmlFor={`req-${questionId}`} className="text-sm text-gray-700 cursor-pointer">
            Required
          </Label>
          <Switch
            id={`req-${questionId}`}
            checked={required}
            onCheckedChange={onRequiredChange}
          />
        </div>
      </div>

      {/* More Options Menu */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleDescriptionClick}>
            <FileText className="h-4 w-4 mr-2" />
            Description
            {showDescription && <span className="ml-auto text-xs text-primary">✓</span>}
          </DropdownMenuItem>
          {questionType === 'multiple_choice' && (
            <DropdownMenuItem onClick={handleResponseValidationClick}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Response validation
              {responseValidation && <span className="ml-auto text-xs text-primary">✓</span>}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
