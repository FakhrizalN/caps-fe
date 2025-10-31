"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Trash2, MoreVertical, FileText, ShieldCheck, Shuffle } from "lucide-react"

interface QuestionFooterProps {
  required: boolean
  questionId: string
  onRequiredChange?: (required: boolean) => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export function QuestionFooterGForm({
  required,
  questionId,
  onRequiredChange,
  onDuplicate,
  onDelete
}: QuestionFooterProps) {
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem>
            <FileText className="h-4 w-4 mr-2" />
            Description
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ShieldCheck className="h-4 w-4 mr-2" />
            Response validation
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle option order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
