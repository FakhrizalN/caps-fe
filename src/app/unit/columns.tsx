"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { EditUnitDialog } from "./edit-unit-dialog"

// Simplified types - only id and name
export type Fakultas = {
  id: string
  name: string
}

export type Jurusan = {
  id: string
  name: string
}

export type ProgramStudi = {
  id: string
  name: string
}

// Helper function to create actions cell
const createActionsCell = (activeTab: string, fakultasData?: Fakultas[], jurusanData?: Jurusan[]) => 
  ({ row }: { row: any }) => {
    const unit = row.original

    const handleDelete = async () => {
      if (window.confirm(`Are you sure you want to delete ${unit.name}?`)) {
        try {
          console.log(`Delete ${activeTab}:`, unit.id)
          await new Promise(resolve => setTimeout(resolve, 1000))
          window.location.reload()
        } catch (error) {
          console.error(`Error deleting ${activeTab}:`, error)
          alert(`Failed to delete ${activeTab}. Please try again.`)
        }
      }
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <EditUnitDialog
              activeTab={activeTab}
              fakultasData={fakultasData || []}
              jurusanData={jurusanData || []}
              unitData={unit}
              trigger={
                <div className="w-full cursor-pointer px-2 py-1.5 text-sm">
                  Edit
                </div>
              }
            />
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

// Columns for Fakultas
export const fakultasColumns: ColumnDef<Fakultas>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-start h-8 px-2 w-full"
        >
          Fakultas
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    enableResizing: false,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: createActionsCell("fakultas"),
  },
]

// Columns for Jurusan  
export const createJurusanColumns = (fakultasData: Fakultas[]): ColumnDef<Jurusan>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-start h-8 px-2 w-full"
        >
          Jurusan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    enableResizing: false,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: createActionsCell("jurusan", fakultasData),
  },
]

// Columns for Program Studi
export const createProdiColumns = (fakultasData: Fakultas[], jurusanData: Jurusan[]): ColumnDef<ProgramStudi>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-start h-8 px-2 w-full"
        >
          Program Studi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    enableResizing: false,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: createActionsCell("prodi", fakultasData, jurusanData),
  },
]

// Keep the original columns for backward compatibility
export const jurusanColumns = createJurusanColumns([])
export const prodiColumns = createProdiColumns([], [])