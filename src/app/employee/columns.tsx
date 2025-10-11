"use client"

import { DataTableColumnHeader } from "@/components/column_header"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"

export type Employee = {
  id: string
  name: string
  email: string
  role: string
  unit: string
  unitId: string
  phone: string
}

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate text-muted-foreground">
            {row.getValue("email")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      
      return (
        <div className="flex w-[100px] items-center">
          <Badge variant={role === "Admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">
            {row.getValue("unit")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "unitId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit ID" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[100px] truncate text-muted-foreground font-mono">
            {row.getValue("unitId")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[150px] truncate font-mono">
            {row.getValue("phone")}
          </span>
        </div>
      )
    },
  },
]