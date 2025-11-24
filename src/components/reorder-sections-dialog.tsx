"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react"
import { useEffect, useState } from "react"

interface SectionItem {
  id: number
  title: string
  order: number
}

interface ReorderSectionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: SectionItem[]
  onReorder: (sections: SectionItem[]) => void
}

function SortableSection({ section, index, total, onMoveUp, onMoveDown }: { 
  section: SectionItem
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-white border rounded-lg"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      
      <div className="flex-1">
        <div className="font-medium">{section.title}</div>
        <div className="text-sm text-gray-500">Section {index + 1} of {total}</div>
      </div>

      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onMoveUp}
          disabled={index === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onMoveDown}
          disabled={index === total - 1}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ReorderSectionsDialog({
  open,
  onOpenChange,
  sections,
  onReorder,
}: ReorderSectionsDialogProps) {
  const [localSections, setLocalSections] = useState<SectionItem[]>([])

  useEffect(() => {
    // Update local sections whenever the sections prop changes or dialog opens
    setLocalSections([...sections].sort((a, b) => a.order - b.order))
  }, [sections, open])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLocalSections((items) => {
        const oldIndex = items.findIndex((item) => item.id.toString() === active.id)
        const newIndex = items.findIndex((item) => item.id.toString() === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      setLocalSections((items) => arrayMove(items, index, index - 1))
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < localSections.length - 1) {
      setLocalSections((items) => arrayMove(items, index, index + 1))
    }
  }

  const handleSave = () => {
    // Update order numbers based on array position
    const reorderedSections = localSections.map((section, index) => ({
      ...section,
      order: index + 1,
    }))
    onReorder(reorderedSections)
    // Don't close immediately - let the parent update state first
    setTimeout(() => {
      onOpenChange(false)
    }, 50)
  }

  const handleCancel = () => {
    // Reset to original sections data
    setLocalSections([...sections].sort((a, b) => a.order - b.order))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reorder sections</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto py-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localSections.map(s => s.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {localSections.map((section, index) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  index={index}
                  total={localSections.length}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
