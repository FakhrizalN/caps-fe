"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Eye, FileUp, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { ImportResponseDialog } from "@/components/import-response-dialog"

import { DataTableViewOptions } from "@/components/column_toggle"
import { DataTablePagination } from "@/components/pagination_table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type ResponseData = {
  id: string
  nama: string
  email: string
  nim: string
}

interface ResponseListTableProps {
  data: ResponseData[]
  surveyId?: string | number
}

export function ResponseListTable({ data, surveyId }: ResponseListTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    select: false, // Hide checkboxes by default on mobile
    email: false,  // Hide email on mobile
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)

  // Update column visibility based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Desktop: show all columns
        setColumnVisibility({ select: true, email: true })
      } else {
        // Mobile: hide select and email
        setColumnVisibility({ select: false, email: false })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const columns: ColumnDef<ResponseData>[] = [
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
    },
    {
      accessorKey: "nama",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Nama
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("nama")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Email
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "nim",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            NIM
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("nim")}</div>,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => {
        const response = row.original
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/survey/${surveyId}/response/${response.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("nama")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px] pl-8"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            size="sm"
            className="h-8 gap-2"
          >
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>

      {/* Import Response Dialog */}
      <ImportResponseDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        surveyId={Number(surveyId)}
        onSuccess={() => {
          toast.success("Responses imported successfully")
          // Parent component should handle refetching data
        }}
      />
    </div>
  )
}
