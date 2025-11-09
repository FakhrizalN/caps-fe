"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react"

interface ResponseDetailHeaderProps {
  currentResponse: string
  totalResponses: number
  currentIndex: number
  onPrevious?: () => void
  onNext?: () => void
  onResponseSelect?: (id: string) => void
  onDelete?: () => void
  onExport?: () => void
  responseList?: Array<{ id: string; nama: string }>
}

export function ResponseDetailHeader({
  currentResponse,
  totalResponses,
  currentIndex,
  onPrevious,
  onNext,
  onResponseSelect,
  onDelete,
  onExport,
  responseList = [],
}: ResponseDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
      {/* Left: Response Selector + Pagination */}
      <div className="flex items-center gap-4">
        <Select value={currentResponse} onValueChange={onResponseSelect}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select response" />
          </SelectTrigger>
          <SelectContent>
            {responseList.map((response) => (
              <SelectItem key={response.id} value={response.id}>
                {response.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={currentIndex <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-900 whitespace-nowrap font-medium">
            {currentIndex} dari {totalResponses}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={currentIndex >= totalResponses}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Button variant="default" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
