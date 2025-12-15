"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, ClipboardList, FileText, Users } from "lucide-react"

// Map survey types to icons
const surveyIcons: Record<string, any> = {
  exit: FileText,
  lv1: ClipboardList,
  lv2: Award,
  skp: Users,
}

interface MobileSurveyCardProps {
  id: string | number
  title: string
  description?: string
  survey_type?: string
  onClick: (surveyId: string | number) => void
}

export function MobileSurveyCard({ 
  id, 
  title, 
  description, 
  survey_type,
  onClick 
}: MobileSurveyCardProps) {
  const Icon = surveyIcons[survey_type || ''] || FileText

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground text-base mb-6">
          {description || 'Tidak ada deskripsi'}
        </CardDescription>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => onClick(id)}
        >
          Isi Kuesioner
        </Button>
      </CardContent>
    </Card>
  )
}
