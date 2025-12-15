"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search, Trash2 } from "lucide-react"
import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/components/pagination_table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Fakultas, Jurusan, ProgramStudi } from "./columns"
import { EditUnitDialog } from "./edit-unit-dialog"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  activeTab?: string
  fakultasData?: Fakultas[]
  jurusanData?: Jurusan[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  activeTab,
  fakultasData = [],
  jurusanData = [],
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedUnit, setSelectedUnit] = React.useState<Fakultas | Jurusan | ProgramStudi | null>(null)

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      size: 150,
      minSize: 20,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableColumnResizing: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      
      const values = Object.values(row.original as Record<string, any>)
        .filter(Boolean)
        .map(value => String(value).toLowerCase())
      
      return values.some(value => value.includes(search))
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleRowClick = (row: any) => {
    if (activeTab) {
      setSelectedUnit(row.original)
      setEditDialogOpen(true)
    }
  }

  const handleDeleteAll = async () => {
    if (selectedCount === 0) return

    const confirmMessage = `Are you sure you want to delete ${selectedCount} selected unit${selectedCount > 1 ? 's' : ''}?`
    
    if (window.confirm(confirmMessage)) {
      try {
        const selectedIds = selectedRows.map(row => (row.original as any).id)
        

        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setRowSelection({})
        
        window.location.reload()
      } catch (error) {
        console.error('Error deleting units:', error)
        alert('Failed to delete units. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="h-8 w-[150px] lg:w-[250px] pl-8"
            />
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              className="h-8"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All ({selectedCount})
            </Button>
          )}
          {/* <DataTableViewOptions table={table} /> */}
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>

      {/* Edit Dialog */}
      {selectedUnit && activeTab && (
        <EditUnitDialog
          activeTab={activeTab}
          fakultasData={fakultasData}
          jurusanData={jurusanData}
          unitData={selectedUnit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  )
}
