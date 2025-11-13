import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type SurveyType } from "@/lib/api"
import { MoreVertical } from "lucide-react"
import { useState } from "react"
import { SurveyDetailDialog } from "./survey-detail-dialog"

interface Survey {
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
}

interface SurveyCardProps {
  survey: Survey
  onEdit: () => void
  isEditMode: boolean
  onDelete?: (surveyId: string) => void
  onDuplicate?: (surveyId: string) => void
  onUpdateSuccess?: () => void // Callback after successful update
}

export function SurveyCard({ 
  survey, 
  isEditMode, 
  onDelete,
  onDuplicate,
  onUpdateSuccess
}: SurveyCardProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const handleDetailSave = (data: {
    title: string
    isOpen: boolean
  }) => {
    // Handle save logic here
    console.log("Survey details:", data)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(survey.id)
    }
  }

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(survey.id)
    }
  }

  return (
    <>
      <Card className="relative">
        <CardHeader>
          {!isEditMode && (
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDetailDialog(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={handleDelete}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          )}
          <CardTitle className="text-base">{survey.title}</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            {survey.is_active ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3">
            {survey.description || "No description available"}
          </p>
        </CardContent>
      </Card>

      <SurveyDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        survey={survey}
        onSave={handleDetailSave}
        onSuccess={onUpdateSuccess}
      />
    </>
  )
}